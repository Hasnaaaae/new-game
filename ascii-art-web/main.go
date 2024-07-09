package main

import (
	"fmt"
	"log"
	"net/http"
	"text/template"
    "ascii-art/Fonctions"
)

var resFinal string

func Handler(w http.ResponseWriter, r *http.Request) {
	tmp1 := template.Must(template.ParseFiles("PAGE.html"))
	//fmt.Println(r.Method)
	if  r.URL.Path != "/" {
		http.Error(w, "Page NOT found", http.StatusNotFound)
		return
	}
	if r.Method != "GET" {
		http.Error(w, "Method is not supported", http.StatusMethodNotAllowed)
		return
	}
	tmp1.Execute(w, nil)
}

func DataHandler(w http.ResponseWriter, r *http.Request) {
	//fmt.Println(r.Method)
    if  r.URL.Path != "/ascii-art" {
		http.Error(w, "Page NOT found", http.StatusNotFound)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method is not supported.", http.StatusMethodNotAllowed) // Error 405
		return
	}
	tmp1 := template.Must(template.ParseFiles("PAGE.html"))
	if err := r.ParseForm(); err != nil {
		fmt.Fprintf(w, "ParseForm() err: %v", err)
		return
	}
	// r.ParseForm()
	banner := r.FormValue("banner")
	text := r.FormValue("text")
	 if banner == "" {
        http.Error(w, "The banner is NOT selected", http.StatusBadRequest) // Error 400
        return
    }

	// Banner := Fonctions.SelectBanner(os.Args)
	resFinal = Fonctions.FichierTxt(banner, text)
	tmp1.Execute(w, resFinal)
}

func main() {
	http.HandleFunc("/", Handler)
	http.HandleFunc("/ascii-art", DataHandler)
	err := http.ListenAndServe(":8081", nil)
	fmt.Println("Listing to the server 8081")
	if err != nil {
		log.Fatal(err)
	}
}


