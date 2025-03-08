// +build debug

package assert

import "log"

func That(condition bool, message string) {
    if !condition {	
		log.Panic("Assertion failed: ", message, "\n")
		panic(1)
    }
}

