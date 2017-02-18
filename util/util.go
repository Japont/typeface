package util

import (
	"fmt"
	"sort"
	"strings"

	"github.com/Japont/typeface/info"
	"github.com/buger/goterm"
	"github.com/google/go-github/github"
	runewidth "github.com/mattn/go-runewidth"
	"github.com/thoas/go-funk"
)

func createGitHubClient() *github.Client {
	client := github.NewClient(nil)
	client.UserAgent = "typeface/" + info.Version
	return client
}

func min(x, y int) int {
	if x < y {
		return x
	}
	return y
}

func max(x, y int) int {
	if x > y {
		return x
	}
	return y
}

// FetchPackageList returns package list
func FetchPackageList() ([]github.TreeEntry, error) {
	client := createGitHubClient()
	tree, _, err := client.Git.GetTree(info.GitHubOwner, info.GitHubRepo, "master", false)
	if err != nil {
		return nil, err
	}

	entries :=
		funk.Filter(tree.Entries, func(e github.TreeEntry) bool {
			return *e.Type == "tree"
		}).([]github.TreeEntry)

	return entries, nil
}

// ShowList prints pretty string list.
func ShowList(list []string) {

	listLen := int(len(list))
	if listLen == 0 {
		return
	}

	width := goterm.Width()

	strLenList := funk.Map(list, func(s string) int {
		return runewidth.StringWidth(s)
	}).([]int)
	sort.SliceStable(strLenList, func(i, j int) bool {
		return i > j
	})
	strMaxLen := strLenList[0]

	columns := max(width/(strMaxLen+3), 1)
	rows := max(listLen/columns, 1)
	columnWidth := width / columns

	for r := 0; r < rows; r++ {
		start := r * columns
		end := min((r+1)*columns, listLen)
		for idx := start; idx < end; idx++ {
			str := list[idx]
			padding := strings.Repeat("\x20", columnWidth-runewidth.StringWidth(str))
			fmt.Printf("%s%s", str, padding)
		}
		fmt.Print("\n")
	}

	return
}
