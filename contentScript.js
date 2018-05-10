const buildSearchEndpoint = searchString => (
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${searchString}&format=json&origin=*`
);

const fetchWikipediaSearchResultSummaries = async text => {
    const search = await fetch(buildSearchEndpoint(text.toLowerCase()), {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "*"
        }
    });
    const searchJson = await search.json();
    const summaries = searchJson && searchJson[2];
    const firstRealSummary = summaries && summaries.find(summary => (
        summary && !summary.includes("may refer to:") && !summary.includes("several meanings:")
    )) 
    return firstRealSummary;
}
const fetchWiktionarySearchResult = async text => {
    const search = await fetch(buildSearchEndpoint(text), {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "*"
        }
    });
    const searchJson = await search.json();
    console.log(searchJson[1][1]);
    return searchJson[1][1];
}

window.onload = () => {
    const resetButton = document.querySelector(".layout > div > div > ul > div button");
    // this button only appears when puzzle has been completed i think?
    const isPuzzleDone = resetButton && resetButton.innerHTML === "reset";
    if (!isPuzzleDone) { return; }
    const cells = document.querySelectorAll('g[data-group=cells] g');
    const rows = [];
    const columns = [];
    // build row + column matrices
    for (i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const positionElement = cell.querySelector('rect');
        const yValue = positionElement.getAttribute("y");
        const yIndex = (parseInt(yValue) - 3) / 33;
        const xValue = positionElement.getAttribute("x");
        const xIndex = (parseInt(xValue) - 3) / 33;
        const textElement = cell.querySelector('text[text-anchor=middle]');
        const text = textElement ? textElement.innerHTML : null;
        if (text) {
            cell.addEventListener("click", async ({ target }) => {
                // ensure that our word arrays have been populated
                if (rowWords.length > 0 && columnWords.length > 0) {
                    const yValue = positionElement.getAttribute("y");
                    const yIndex = (parseInt(yValue) - 3) / 33;
                    const xValue = positionElement.getAttribute("x");
                    const xIndex = (parseInt(xValue) - 3) / 33;
                    const columnWord = columnWords.find(word => (
                        word.column === xIndex && yIndex >= word.startIdx && yIndex <= word.endIdx
                    ))
                    const rowWord = rowWords.find(word => (
                        word.row === yIndex && xIndex >= word.startIdx && xIndex <= word.endIdx
                    ))
                    if (columnWord) {
                        const columnWordSummaries = await fetchWikipediaSearchResultSummaries(columnWord.text)
                        console.log(columnWord.text.toUpperCase() + ":")
                        console.log("_____________________")
                        console.log(columnWordSummaries);
                        console.log("_____________________")
                    }
                    if (rowWord) {
                        const rowWordSummaries = await fetchWikipediaSearchResultSummaries(rowWord.text)
                        console.log(rowWord.text.toUpperCase() + ":")
                        console.log("_____________________")
                        console.log(rowWordSummaries);
                        console.log("_____________________")
                    }
                }
            });
        }
        if (!rows[yIndex]) {
            rows[yIndex] = [];
        }
        if (!columns[xIndex]) {
            columns[xIndex] = [];
        }

        rows[yIndex].push(text);
        columns[xIndex].push(text);
    }

    const rowWords = [];
    let currentRowWord;
    for (i = 0; i < rows.length; i++) {
        for (j = 0; j < rows[i].length; j++) {
            const char = rows[i][j];
            if (!char || j === rows[i].length - 1) {
                if (currentRowWord) {
                    currentRowWord.endIdx = char ? j : j - 1;
                    currentRowWord.text = char ? `${currentRowWord.text}${char}` : currentRowWord.text;
                    rowWords.push(currentRowWord);
                    currentRowWord = null;  
                }              
            } else if (char && !currentRowWord) {
                currentRowWord = {
                    startIdx: j,
                    endIdx: null,
                    text: char,
                    row: i
                }
            } else {
                currentRowWord.text = `${currentRowWord.text}${char}`;
            }
        }
    }


    const columnWords = [];
    let currentColumnWord;
    for (i = 0; i < columns.length; i++) {
        for (j = 0; j < columns[i].length; j++) {
            const char = columns[i][j];
            if (!char || j === columns[i].length - 1) {
                if (currentColumnWord) {
                    currentColumnWord.endIdx = char ? j : j - 1;
                    currentColumnWord.text = char ? `${currentColumnWord.text}${char}` : currentColumnWord.text;
                    columnWords.push(currentColumnWord);
                    currentColumnWord = null;  
                }              
            } else if (char && !currentColumnWord) {
                currentColumnWord = {
                    startIdx: j,
                    endIdx: null,
                    text: char,
                    column: i
                }
            } else {
                currentColumnWord.text = `${currentColumnWord.text}${char}`;
            }
        }
    }
}