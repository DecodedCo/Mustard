package controllers

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

var bannedUrl string
var redirectUrl string
var banned []string
var redirect []string
var newsSites []string

var fileLocation string
var harLocation string
var usersLocation string
var proxyAddress string
var logLocation string

//this all needs work for productisation
func setFileStorageLocation() (string, string) {
	if os.Getenv("STATE") == "PRODUCTION" {
		proxyAddress = "192.168.99.1"
	} else {
		proxyAddress = "localhost"
	}
	pwd, err := os.Getwd()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	bannedUrl = pwd + "/public/banned.json"
	log.Println("banned url: ", bannedUrl)
	log.Println("Proxy Address: ", proxyAddress)
	
	redirectUrl = pwd + "/public/redirect.json"
	harLocation = "/var/mustard"
	usersLocation = "/var/mustard"
	//there is a bug so these need to be set manually for now
	fileLocation = "/srv/mitmfiles"
	fmt.Println("location: ", fileLocation)
	// proxyAddress = "192.168.99.1"

	logLocation = os.Getenv("HOME")
	return fileLocation, proxyAddress
}

//pulls the urls to redirect from the url
func getRedirectUrls() {
	if len(redirect) > 0 {
		return
	}
	file, _ := ioutil.ReadFile(redirectUrl)
	err := json.Unmarshal(file, &redirect)
	if err != nil {
		log.Println("Error: ", err.Error())
	}
}

//pulls the urls to block access to from the url
func getBannedUrls() {
	if len(banned) > 0 {
		return
	}
	file, _ := ioutil.ReadFile(bannedUrl)

	err := json.Unmarshal(file, &banned)
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

	log.Println("Reading " + fileLocation)

	log.Println("length: ", len(files))
	if len(files) > 0 {
		return true
	} else {
		return false
	}
}

//gets any pages that are required from the url
func getPages() {
	// if CheckIfFilesAlreadyExist() {
	// 	return
	// }
	url := "http://komodobank.com/_admin/mitm/mitmfiles.zip"
	urlReader, err := getReaderFromUrl(url)
	if err != nil {
		log.Fatalf("Unable to get <%s>: %s", url, err)
	}
	reader, err := zip.NewReader(urlReader, int64(urlReader.Len()))
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	// defer reader.Close()

	for _, f := range reader.File {

		zipped, err := f.Open()
		if err != nil {
			log.Println(err)
			// os.Exit(1)
		}

		defer zipped.Close()

		// get the individual file name and extract the current directory

		path := filepath.Join(fileLocation, f.Name)

		if f.FileInfo().IsDir() {
			os.MkdirAll(path, f.Mode())
			log.Println("Creating directory", path)
		} else {
			writer, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, f.Mode())

			if err != nil {
				log.Println(err)
				// os.Exit(1)
			}

			defer writer.Close()

			if _, err = io.Copy(writer, zipped); err != nil {
				log.Println(err)
				// os.Exit(1)
			}

			log.Println("Decompressing : ", path)

		}
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
