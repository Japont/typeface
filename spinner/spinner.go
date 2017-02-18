// Based on briandowns/spinner
// https://github.com/briandowns/spinner
//
// Copyright 2017 briandowns
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright © 2017 3846masa
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

package spinner

import (
	"fmt"
	"io"
	"runtime"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/fatih/color"
	spin "github.com/tj/go-spin"
)

// Spinner struct to hold the provided options
type Spinner struct {
	Suffix        string
	Prefix        string
	color         *color.Color
	lastOutputLen int
	lock          *sync.RWMutex
	running       bool
	spin          *spin.Spinner
	stopChan      chan bool
	writer        io.Writer
}

// New provides a pointer to an instance of Spinner
func New() *Spinner {
	return &Spinner{
		Suffix:        "",
		Prefix:        "",
		color:         color.New(color.FgCyan),
		lastOutputLen: 0,
		lock:          &sync.RWMutex{},
		running:       false,
		spin:          spin.New(),
		stopChan:      make(chan bool),
		writer:        color.Output,
	}
}

// Start will start the indicator
func (sp *Spinner) Start() {
	if sp.running {
		return
	}
	sp.running = true
	sp.spin.Set(spin.Box1)

	go func() {
		for {
			select {
			case <-sp.stopChan:
				{
					fmt.Println("Stopped")
					return
				}
			default:
				{
					sp.lock.Lock()

					spinStr := sp.color.Sprint(sp.spin.Next())
					output := fmt.Sprintf("\r%s%s%s", sp.Prefix, spinStr, sp.Suffix)

					outputLen := utf8.RuneCountInString(output)
					if outputLen != sp.lastOutputLen {
						sp.erase()
					}
					fmt.Fprint(sp.writer, output)
					sp.lastOutputLen = outputLen

					sp.lock.Unlock()
					time.Sleep(100 * time.Millisecond)
				}
			}
		}
	}()
}

// Stop stops the indicator
func (sp *Spinner) Stop() {
	if !sp.running {
		return
	}

	sp.lock.Lock()
	defer sp.lock.Unlock()
	sp.erase()
	sp.running = false

	select {
	case sp.stopChan <- true:
	default:
	}
}

func (sp *Spinner) erase() {
	if runtime.GOOS == "windows" {
		for _, c := range []string{"\b", "\x20", "\b"} {
			for i := 0; i < sp.lastOutputLen; i++ {
				fmt.Fprint(sp.writer, c)
			}
		}
	} else {
		fmt.Fprint(sp.writer, "\033[2K\r")
	}
}
