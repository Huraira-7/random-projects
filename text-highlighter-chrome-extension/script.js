
function escapeHtml(text) {  // Helper function to escape HTML characters
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function highlightDifferences(original, comparison) {
    let originalLines = original.split('\n');
    let comparisonLines = comparison.split('\n');
    let maxLength = Math.max(originalLines.length, comparisonLines.length);
    let highlightedOriginal = [];
    let highlightedComparison = [];
    
    for (let i = 0; i < maxLength; i++) {
        let line1 = originalLines[i] || "";
        let line2 = comparisonLines[i] || "";
        
        let words1 = line1.split(' ');
        let words2 = line2.split(' ');
        let minLength = Math.min(words1.length, words2.length);
        let highlightedLine1 = [];
        let highlightedLine2 = [];
        
        for (let j = 0; j < minLength; j++) {
            if (words1[j] !== words2[j]) {
                // Escape HTML before wrapping in span
                let escapedWord1 = escapeHtml(words1[j]);
                let escapedWord2 = escapeHtml(words2[j]);
                highlightedLine1.push(`<span class='highlight'>${escapedWord1}</span>`);
                highlightedLine2.push(`<span class='highlight'>${escapedWord2}</span>`);
            } else {
                // Escape non-highlighted words too for consistency
                highlightedLine1.push(escapeHtml(words1[j]));
                highlightedLine2.push(escapeHtml(words2[j]));
            }
        }
        
        for (let j = minLength; j < words1.length; j++) {
            let escapedWord1 = escapeHtml(words1[j]);
            highlightedLine1.push(`<span class='highlight'>${escapedWord1}</span>`);
        }
        
        for (let j = minLength; j < words2.length; j++) {
            let escapedWord2 = escapeHtml(words2[j]);
            highlightedLine2.push(`<span class='highlight'>${escapedWord2}</span>`);
        }
        
        highlightedOriginal.push(highlightedLine1.join(' '));
        highlightedComparison.push(highlightedLine2.join(' '));
    }
    
    return [highlightedOriginal.join('\n'), highlightedComparison.join('\n')];
}

function compareTexts() {
    let text1 = document.getElementById('text1').value;
    let text2 = document.getElementById('text2').value;
    let [output1, output2] = highlightDifferences(text1, text2);
    
    document.getElementById('output1').innerHTML = output1.replace(/\n/g, '<br>');
    document.getElementById('output2').innerHTML = output2.replace(/\n/g, '<br>');
}

function loadFile(event, target) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        let content = e.target.result;
        if (file.name.endsWith('.ipynb')) {
            try {
                let notebook = JSON.parse(content);
                let codeCells = notebook.cells.filter(cell => cell.cell_type === 'code').map(cell => cell.source.join('\n')).join('\n\n');
                document.getElementById(target).value = codeCells;
            } catch (error) {
                document.getElementById('error-message').textContent = "Error processing .ipynb file.";
                return;
            }
        } else {
            document.getElementById(target).value = content;
        }
    };
    reader.readAsText(file);
}

function clearFields() {
    document.getElementById('file1').value = "";
    document.getElementById('file2').value = "";
    document.getElementById('text1').value = "";
    document.getElementById('text2').value = "";
    document.getElementById('output1').innerHTML = "";
    document.getElementById('output2').innerHTML = "";
    document.getElementById('error-message').textContent = "";
}

// Add event listeners after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('file1').addEventListener('change', function(event) {
        loadFile(event, 'text1');
    });
    document.getElementById('file2').addEventListener('change', function(event) {
        loadFile(event, 'text2');
    });
    document.getElementById('clearButton').addEventListener('click', clearFields);
    document.getElementById('compareButton').addEventListener('click', compareTexts);
});

