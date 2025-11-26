
// This file relies on jspdf and html2canvas, which are loaded from a CDN in index.html
// So we declare them here to satisfy TypeScript
declare const jspdf: any;
declare const html2canvas: any;

export const exportAsPdf = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
    }

    try {
        const { jsPDF } = jspdf;
        // High scale for better quality, white background
        const canvas = await html2canvas(element, {
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Standard A4 dimensions: 210mm x 297mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        
        // Calculate the image dimensions to fit the PDF width
        const imgProps = pdf.getImageProperties(imgData);
        // Calculate the height in mm needed to display the image at full width
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // If the content is longer than one page, add new pages
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save('document.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};


export const getCanvasAsFile = async (elementId: string, fileName: string): Promise<File | null> => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return null;
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob from canvas.');
                    resolve(null);
                    return;
                }
                const file = new File([blob], fileName, { type: 'image/png' });
                resolve(file);
            }, 'image/png', 1.0);
        });

    } catch (error) {
        console.error("Error generating canvas:", error);
        return null;
    }
}

export const exportAsImage = async (elementId: string) => {
    const file = await getCanvasAsFile(elementId, 'document.png');
    if (!file) {
        console.error("Failed to generate image file.");
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // Clean up
    } catch (error) {
        console.error("Error creating download link:", error);
    }
};

export const exportAsWord = (elementId: string, fileName: string = 'document.doc') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
    }

    // Word relies on standard CSS. We add a style block to map some common utilities used in our HTML.
    // Note: Inline styles on elements (which we use in PrintableView) have the best compatibility.
    const preHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>${fileName}</title>
            <style>
                body { font-family: sans-serif; line-height: 1.5; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; border-bottom: 1px solid #ddd; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
            </style>
        </head>
        <body>
    `;
    const postHtml = "</body></html>";
    
    const htmlContent = preHtml + element.innerHTML + postHtml;

    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
