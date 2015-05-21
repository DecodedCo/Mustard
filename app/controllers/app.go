package controllers

import (
	"github.com/revel/revel"
	"log"
)

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
	listener = PassThrough()
	return c.RenderJson("")
}
func (c App) ReplacePage() revel.Result {
	KillProxy()
	listener = ReplacePage()
	return c.RenderJson("")
}
func (c App) BlockWebsites() revel.Result {
	KillProxy()
	listener = BlockWebsites()
	return c.RenderJson("")
}

func KillProxy() {
	if listener != nil {
		listener.Close()		
	}
}
var data []string

func (c App) GetData() revel.Result {
	return c.RenderJson(data)
}
func (c App) AppendData() revel.Result {
	//window.setInterval(function(){var d = new Date()%3Bvar n = d.getTime()%3B$.get( "http://127.0.0.1:9000/data?time="+n, function( data ) {})%3B}, 1000)%3B
	var d string
	c.Params.Bind(&d, "data")
	if d != "" {
		data = append(data, d)
		return c.RenderJson("updated")
	}	
	// log.Println("data: ", data)
	return c.RenderJson("null")
}

func (c App) InterceptHTTPS() revel.Result {
	KillProxy()
	log.Println("interceptor")
	listener = HTTPSInterceptor()
	return c.RenderJson("")

}

// //an end point that shows what they see on a url
// func (c App) Show() revel.Result {
// 	//needs to get the response and render html
// 	c.Render()
// }
func (c App) Index() revel.Result {
	return c.Render()
}
