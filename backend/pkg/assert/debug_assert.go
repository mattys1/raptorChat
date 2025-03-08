// +build debug

package assert

import "log"

func Panic(condition bool, message string) {
    if !condition {	
		log.Panic("Assertion failed: ", message, "\n")
		panic(1)
    }
}

