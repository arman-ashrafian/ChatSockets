package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

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
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080" // dev port
	}
	port = ":" + port

	r := mux.NewRouter() // Mux Router

	hub := newHub() // chat hub
	go hub.run()    // run hub in a goroutine

	// serve static files
	r.PathPrefix("/static/").
		Handler(http.StripPrefix("/static/",
			http.FileServer(http.Dir("static"))))

	r.HandleFunc("/", serveHome)
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		servews(hub, w, r)
	})

	log.Println("Listening - Port:" + port)
	err := http.ListenAndServe(port, r)
	if err != nil {
		log.Fatal("ListenAndSeve: ", err)
	}

}
