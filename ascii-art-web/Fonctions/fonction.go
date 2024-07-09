package Fonctions

import (
	"fmt"
	"os"
	"strings"
)

func Principale(str string, arg string) string {
	var resultat string
	if len(os.Args) == 3 && (os.Args[2] == "thinkertoy" || os.Args[2] == "thinkertoy.txt") {
		str = strings.ReplaceAll(str, "\r\n", "\n")
	}
	split := strings.Split(str[1:], "\n\n")
	tableau := AsciiTable(split)
	Lines := strings.Split(arg, "\\n")
	if Empty(Lines) {
		Lines = Lines[1:]
	}
	for _, str := range Lines {
		if str == "" {
			resultat += "\n"
		} else {
			resultat += AddLine(tableau, str)
		}
	}
	return resultat
}

func AddLine(tableau [][]string, str string) string {
	//w http.ResponseWriter
	resultat := ""
	err := false
	for k := 0; k < 8*len(str); k++ {
		if int(str[k%len(str)]) < 32 || int(str[k%len(str)]) > 126 {
			if !err {
				err = true
				fmt.Println("Check your input you have a character not printible!")
				//tmp1.Execute(w, "Check your input you have a character not printible!")
			}
		} else {
			resultat += (tableau[int(str[k%len(str)])-32][k/len(str)%8])
		}
		if (k+1)%len(str) == 0 {
			resultat += "\n"
		}
	}
	return resultat
}

func AsciiTable(split_File []string) [][]string {
	var tableau [][]string
	for i := 0; i < len(split_File); i++ {
		tableau = append(tableau, strings.Split(split_File[i], "\n"))
	}
	return tableau
}

func Empty(Lines []string) bool {
	for _, str := range Lines {
		if str != "" {
			return false
		}
	}
	return true
}
