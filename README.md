How to run the project (npm install && npm start) 
- npm install
- npm run dev
Screenshot or screen recording


https://github.com/user-attachments/assets/7be18c64-7331-4603-8553-354183cb81af


<img width="1904" height="940" alt="Screenshot 2025-07-11 204001" src="https://github.com/user-attachments/assets/de68bf04-13a7-4d6f-a143-1d4eb12faa4c" />



How citation linking was handled

- 1. Citation Data Structure

interface Citation {
  text: string;        // The quoted text from the PDF
  source: string;      // PDF filename
  link: string;        // Path to the PDF file
  paragraph?: string;  // Paragraph reference (e.g., "Para 7")
  page?: number;       // Page number
}


- 2. PDF Content Mapping
The system uses a mock PDF content structure that maps the actual PDF content:


const pdfContent = {
  "Dani_Devi_v_Pritam_Singh.pdf": {
    content: `...full PDF text...`,
    paragraphs: {
      7: "as the age of the deceased at the time of accident was held to be about 54-55 years, being self-employed, 10% of annual income should have been awarded on account of future prospects."
    }
  }
};


- 3. Intelligent Query Processing
The researchPDF() function analyzes user queries and matches them to relevant PDF content:


const researchPDF = (query: string): { answer: string; citations: Citation[] } => {
  const lowerQuery = query.toLowerCase();
  
  // Check for relevant keywords
  if (lowerQuery.includes('future prospects') || 
      lowerQuery.includes('self-employed') || 
      lowerQuery.includes('54') || 
      lowerQuery.includes('55')) {
    
    return {
      answer: "Legal response based on PDF content...",
      citations: [{
        text: "Exact quote from paragraph 7...",
        source: "Dani_Devi_v_Pritam_Singh.pdf",
        link: "/Dani Vs Pritam (Future 10 at age 54-55).pdf",
        paragraph: "Para 7",
        page: 1
      }]
    };
  }
};


- 4. Citation Display & Interaction
Citations are rendered as interactive cards below each AI response:


{message.citations?.map((citation, index) => (
  <div key={index} className="citation-card">
    <p className="quoted-text">"{citation.text}"</p>
    <div className="citation-meta">
      <FileText className="icon" />
      <span>{citation.paragraph} • {citation.source}</span>
    </div>
    <button onClick={() => handleCitationClick(citation)}>
      <ExternalLink className="icon" />
      View Document
    </button>
  </div>
))}

        
- 5. PDF Modal Implementation
When a citation is clicked, it opens a modal with the PDF:


const handleCitationClick = (citation: Citation) => {
  setCurrentPdfUrl(citation.link);           // Set PDF URL
  setCurrentParagraph(citation.paragraph);   // Set paragraph reference
  setShowPdfViewer(true);                   // Show modal
};



- 6. Modal PDF Viewer
The modal displays the PDF with context about which paragraph is being referenced:


<div className="pdf-modal">
  <div className="modal-header">
    <h3>Legal Document</h3>
    {currentParagraph && (
      <p>Viewing: {currentParagraph}</p>
    )}
  </div>
  <iframe 
    src={currentPdfUrl} 
    className="pdf-iframe"
    title="Legal Document"
  />
</div>
