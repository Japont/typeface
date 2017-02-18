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

package cmd

import (
	"errors"
	"sort"

	"github.com/Japont/typeface/spinner"
	"github.com/Japont/typeface/util"
	"github.com/google/go-github/github"
	"github.com/renstrom/fuzzysearch/fuzzy"
	"github.com/spf13/cobra"
	funk "github.com/thoas/go-funk"
)

// searchCmd represents the search command
var searchCmd = &cobra.Command{
	Use:   "search [package]",
	Short: "Search a package",
	Long:  ``,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		if len(args) != 1 {
			return errors.New("Invalid arguments")
		}
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		sp := spinner.New()
		sp.Start()

		// Load packageList
		sp.Suffix = "\x20\x20Loading Package List..."
		entries, err := util.FetchPackageList()
		if err != nil {
			sp.Stop()
			return err
		}

		// Fuzzy-search
		sp.Suffix = "\x20\x20Searching Package..."

		nameList := funk.Map(entries, func(e github.TreeEntry) string {
			return *e.Path
		}).([]string)

		resultRanks := fuzzy.RankFind(args[0], nameList)
		sort.Sort(resultRanks)
		results := funk.Map(resultRanks, func(r fuzzy.Rank) string {
			return r.Target
		}).([]string)

		sp.Stop()
		util.ShowList(results)

		return nil
	},
}

func init() {
	RootCmd.AddCommand(searchCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// searchCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// searchCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")

}
