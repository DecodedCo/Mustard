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
var banned  []string
var redirect []string

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
	log.Println("redirect check: ", redirect)
	if redirect != nil {
		return
	}
	url := "http://komodobank.com/_admin/mitm/redirect.json"

	res, err := http.Get(url)
	if err != nil {
        panic(err.Error())
    }
    body, err := ioutil.ReadAll(res.Body)
    if err != nil {
        panic(err.Error())
    }
    err = json.Unmarshal(body, &redirect)
    if err != nil {
        panic(err.Error())
    }
}
//pulls the urls to block access to from the url
func getBannedUrls() {
	log.Println("banned check: ", banned)
	if banned != nil {
		return
	}
	url := "http://komodobank.com/_admin/mitm/blocked.json"

	res, err := http.Get(url)
	if err != nil {
        panic(err.Error())
    }
    body, err := ioutil.ReadAll(res.Body)
    if err != nil {
        panic(err.Error())
    }
    err = json.Unmarshal(body, &banned)
    if err != nil {
        panic(err.Error())
    }
}
//gets any pages that are required from the url
func getPages() {
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




