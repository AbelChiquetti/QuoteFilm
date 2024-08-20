let glassList = [];

// Função para adicionar vidros à lista
function addGlass() {
    const height = document.getElementById('height').value;
    const filmWidth = document.getElementById('filmWidth').value;

    if (filmWidth && height) {
        const widthMM = parseInt(filmWidth) * 10;
        const heightMM = parseInt(height);
        glassList.push({ width: widthMM, height: heightMM });
        updateGlassList();
        document.getElementById('height').value = '';
    } else {
        alert('Por favor, selecione a largura da película e insira as medidas.');
    }
}

// Função para atualizar a lista de vidros na interface
function updateGlassList() {
    const glassListElement = document.getElementById('glassList');
    glassListElement.innerHTML = '';
    glassList.forEach((glass, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `Vidro ${index + 1}: ${glass.width / 10} mm x ${glass.height} mm <span onclick="removeGlass(${index})">🗑️</span>`;
        glassListElement.appendChild(listItem);
    });
}

// Função para remover um vidro da lista
function removeGlass(index) {
    glassList.splice(index, 1);
    updateGlassList();
}

// Função para calcular a melhor disposição dos vidros e o comprimento total necessário
function calculate() {
    const canvas = document.getElementById('cuttingMap');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const filmWidthMM = parseInt(document.getElementById('filmWidth').value) * 10;
    const scale = canvas.width / filmWidthMM;

    glassList.sort((a, b) => b.height - a.height);

    let currentHeight = 0;
    let lineHeight = 0;
    let currentWidth = 0;

    glassList.forEach(glass => {
        if (glass.width <= filmWidthMM) {
            if (currentWidth + glass.width > filmWidthMM) {
                currentHeight += lineHeight;
                lineHeight = 0;
                currentWidth = 0;
            }

            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
            ctx.fillRect(currentWidth * scale, currentHeight * scale, glass.width * scale, glass.height * scale);

            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${glass.width / 10} mm x ${glass.height} mm`, (currentWidth + glass.width / 2) * scale, (currentHeight + glass.height / 2) * scale);

            currentWidth += glass.width;
            lineHeight = Math.max(lineHeight, glass.height);
        } else {
            alert(`O vidro de ${glass.width / 10} mm não cabe na largura da película.`);
        }
    });

    currentHeight += lineHeight;
    const totalHeight = currentHeight;

    const result = document.getElementById('result');
    result.textContent = `Você precisará de ${(totalHeight / 10).toFixed(2)} m de comprimento de película.`;

    // Exibir campo para nome do cliente e botão de exportação de PDF
    document.getElementById('clientNameContainer').style.display = 'block';
}

// Função para exportar o orçamento para PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const canvas = document.getElementById('cuttingMap');
    const imgData = canvas.toDataURL('images/logo.svg');
    const clientName = document.getElementById('clientName').value;
    const currentDate = new Date().toLocaleDateString();

    if (!clientName) {
        alert('Por favor, insira o nome do cliente.');
        return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.addImage('images/logo.svg', 'svg', 10, 10, 50, 22);
    doc.text(`Orçamento de Película para ${clientName}`, 70, 20);
    doc.text(`Data: ${currentDate}`, 70, 30);
    doc.addImage(imgData, 'PNG', 10, 40, 190, 100);
    doc.text(`Comprimento necessário: ${document.getElementById('result').textContent}`, 10, 150);
    doc.save(`Orçamento ${clientName.replace(/ /g, '_')}.pdf`);
}