// +build debug

package assert

// import "log"

func That(condition bool, message string, err error) {
    if !condition {	
		if err != nil {
			message += " --- ERR: " + err.Error()	
		} 
		panic("Assertion failed: " + message + "\n")
		
    }
}

