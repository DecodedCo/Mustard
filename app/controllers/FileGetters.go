package controllers

import (
	"net/http"
	"io/ioutil"
	"encoding/json"
	"path/filepath"
	"archive/zip"
	"strings"
	"bytes"
	"log"
	"os"
	"io"
)

const (
	bannedUrl = "http://komodobank.com/_admin/mitm/blocked.json"
	redirectUrl = "http://komodobank.com/_admin/mitm/redirect.json"
	newsUrl = "http://komodobank.com/_admin/mitm/locations.json"
)
var banned  []string
var redirect []string
var newsSites []string

var fileLocation string

func setFileStorageLocation() {
	if os.Getenv("STATE") == "PRODUCTION" {
		fileLocation = "/srv/mitmfiles"
	} else {
		fileLocation = os.Getenv("HOME")+"/mitmfiles"
	}
}
//pulls the urls to redirect from the url
func getRedirectUrls() {
	if len(redirect) > 0 {
		return
	}

	res, err := http.Get(redirectUrl)
	if err != nil {
        log.Println("Error: ", err.Error())
        return
    }
    body, err := ioutil.ReadAll(res.Body)
    if err != nil {
        log.Println("Error: ", err.Error())
    }
    err = json.Unmarshal(body, &redirect)
    if err != nil {
        log.Println("Error: ", err.Error())
    }
}
//pulls the urls to block access to from the url
func getBannedUrls() {
	if len(banned) > 0 {
		return
	}

	res, err := http.Get(bannedUrl)
	if err != nil {
        log.Println("Error: ", err.Error())
        return
    }
    body, err := ioutil.ReadAll(res.Body)
    if err != nil {
        log.Println("Error: ", err.Error())
    }
    err = json.Unmarshal(body, &banned)
    if err != nil {
        log.Println("Error: ", err.Error())
    }
}
//pulls the urls to block access to from the url
func getNewsUrls() {
	if len(newsSites) > 0 {
		return
	}

	res, err := http.Get(newsUrl)
	if err != nil {
        log.Println("Error: ", err.Error())
        return
    }
    body, err := ioutil.ReadAll(res.Body)
    if err != nil {
        log.Println("Error: ", err.Error())
    }
    err = json.Unmarshal(body, &newsSites)
    if err != nil {
        log.Println("Error: ", err.Error())
    }
}

func CheckIfFilesAlreadyExist() bool {
	d, err := os.Open(fileLocation)
	if err != nil {
		log.Println("Error: ", err)
	}
	defer d.Close()

	files, err := d.Readdir(-1)
	if err != nil {
		log.Println("Error: ", err)
		return false
	}

	log.Println("Reading "+ fileLocation)

	log.Println("length: ", len(files))
	if len(files) > 0 {
		return true
	} else {
		return false
	}
}

//gets any pages that are required from the url
func getPages() {
	if CheckIfFilesAlreadyExist() {
		return
	}
	url := "http://komodobank.com/_admin/mitm/mitmfiles.zip"
	urlReader, err := getReaderFromUrl(url)
	if err != nil {
		log.Fatalf("Unable to get <%s>: %s", url, err)
	}
	zr, err := zip.NewReader(urlReader, int64(urlReader.Len()))
	if err != nil {
		log.Fatalf("Unable to read zip: %s", err)
	}
	for _, zf := range zr.File {
			writeFileToDisk(zf)
	}
}
//a URL reader - returns a byte reader. Used for pulling zip files and extracting the contents
func getReaderFromUrl(url string) (*bytes.Reader, error) {
	res, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	buf := &bytes.Buffer{}

	_, err = io.Copy(buf, res.Body)
	if err != nil {
		return nil, err
	}

	return bytes.NewReader(buf.Bytes()), nil
}
//writes files to disk after extracting from a zip file
func writeFileToDisk(zf *zip.File) {
		fr, err := zf.Open()
		if err != nil {
			log.Printf("Unable to read file: %s", zf.Name)
			return
		}
		defer fr.Close()

		path := strings.Replace(filepath.Join(fileLocation, zf.Name), `/`, string(filepath.Separator), -1)
		dir, _ := filepath.Split(path)
		log.Printf("path: %s, dir: %s", path, dir)
		err = os.MkdirAll(dir, 0777)
		if err != nil {
			log.Printf("Unable to create directory: %s", dir)
			return
		}

		f, err := os.Create(path)
		if err != nil {
			log.Printf("Unable to create file: %s", path)
			return
		}
		defer f.Close()

		_, err = io.Copy(f, fr)
		if err != nil {
			log.Printf("Issue writing file <%s>: %s", path, err)
			return
		}
		return
}




