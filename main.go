package main

import (
	"log"
	"net/http"
)

var port = ":8080"

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not Found", 404)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	http.ServeFile(w, r, "home.html")
}

func main() {
	hub := newHub()

	go hub.run()

	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		servews(hub, w, r)
	})

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("ListenAndSeve: ", err)
	}

}
