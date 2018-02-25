package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

var screennames []string

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
	r.HandleFunc("/registeruser/{screenname}", registerUser)
	r.HandleFunc("/unregister/{screenname}", unregisterUser)

	log.Println("Listening - Port:" + port)
	err := http.ListenAndServe(port, r)
	if err != nil {
		log.Fatal("ListenAndSeve: ", err)
	}

}

/********************* ROUTES **************************/
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

type registrationResponse struct {
	Okay bool `json:"okay"`
}

func registerUser(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	screenname := mux.Vars(r)["screenname"]
	ok := screennameAvailable(screenname)
	resp := registrationResponse{
		Okay: ok,
	}
	json.NewEncoder(w).Encode(resp)
}

func unregisterUser(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	screenname := mux.Vars(r)["screenname"]
	deleteIndex := -1
	for i, name := range screennames {
		if name == screenname {
			deleteIndex = i
		}
	}
	if deleteIndex > 0 {
		screennames = removeString(screennames, deleteIndex)
	}
}

/******************* Utils *******************************/
func screennameAvailable(sn string) bool {
	for _, name := range screennames {
		if sn == name {
			return false
		}
	}
	screennames = append(screennames, sn)
	return true
}

// remove element by index
// does not preserve order
func removeString(slice []string, i int) []string {
	slice[i] = slice[len(slice)-1] // move last element into gap
	return slice[:len(slice)-1]
}
