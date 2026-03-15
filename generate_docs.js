const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, BorderStyle } = require('docx');

async function createDocumentation() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Section
          new Paragraph({
            text: 'CASE STUDY: CLOUD INFRASTRUCTURE AUTOMATION & MONITORING SUITE',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: 'Built with Node.js and AWS SDK v3',
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
                new TextRun({ text: 'Built with Node.js and AWS SDK v3', italics: true, size: 28, color: "555555" })
            ]
          }),

          // 1. Executive Summary
          new Paragraph({
            text: '1. Executive Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'This project is a custom-built, end-to-end AWS infrastructure monitoring console. Designed to replace heavy web frameworks with a lightning-fast terminal dashboard, it automatically provisions EC2 instances, establishes CloudWatch metric streams, and configures SNS threat alerting entirely through code using the modern AWS SDK v3 for Node.js.',
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),

          // 2. Tech Stack & Architecture
          new Paragraph({
            text: '2. Tech Stack & Architecture',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }
          }),
          new Paragraph({ text: '• Core Language: Node.js', bullet: { level: 0 } }),
          new Paragraph({ text: '• Cloud Provider: Amazon Web Services (AWS)', bullet: { level: 0 } }),
          new Paragraph({ text: '• SDK: @aws-sdk (v3) modular clients (EC2, CloudWatch, SNS, SSM)', bullet: { level: 0 } }),
          new Paragraph({ text: '• Interface: Terminal User Interface (TUI) via blessed & blessed-contrib', bullet: { level: 0 }, spacing: { after: 200 } }),

          // 3. Step-by-Step Implementation
          new Paragraph({
            text: '3. Engineering Implementation',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }
          }),

          new Paragraph({ text: 'Phase 1: Dynamic EC2 Provisioning & Network Fallbacks', heading: HeadingLevel.HEADING_2, spacing: { before: 100, after: 50 }}),
          new Paragraph({ 
            text: 'Instead of relying on hardcoded variables, the system queries the AWS SSM Parameter Store to dynamically resolve the latest Amazon Linux 2023 AMI. Furthermore, a robust network-fallback logic was implemented: if an account lacks a Default VPC, the script intercepts the failure, auto-generates a Default VPC via the SDK, and seamlessly retries the t3.micro server launch.',
            spacing: { after: 150 }
          }),

          new Paragraph({ text: 'Phase 2: CloudWatch Metrics & SNS Alert Pipelines', heading: HeadingLevel.HEADING_2, spacing: { before: 100, after: 50 }}),
          new Paragraph({ 
            text: 'For infrastructure health, the suite fetches 1-hour timelines of CPU, Memory, and Disk networking data. It simultaneously registers an SNS Topic and attaches a programmatic CloudWatch Metric Alarm. If compute load exceeds 80% for 5 minutes, email alerts are dispatched to the operations team.',
            spacing: { after: 150 }
          }),

          new Paragraph({ text: 'Phase 3: The Terminal Dashboard (TUI)', heading: HeadingLevel.HEADING_2, spacing: { before: 100, after: 50 }}),
          new Paragraph({ 
            text: 'The entire system is visualized in the terminal grid layout featuring live EC2 Instance status tables, an animated CPU line chart, and real-time backend action logs to monitor the asynchronous AWS interactions.',
            spacing: { after: 300 }
          }),

          // 4. Project Results & Visuals
          new Paragraph({
            text: '4. Project Results & Visuals',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } }
          }),
          new Paragraph({ 
            text: 'The screenshots below demonstrate the application compiling successfully on Windows, successfully making authenticated API requests to AWS, and rendering the TUI matrix.',
            spacing: { after: 200 }
          }),
          
          // Image 1
          new Paragraph({
            children: [
              new ImageRun({
                data: fs.readFileSync(path.join(__dirname, 'assets', 'Screenshot png 1,2', 'Screenshot 2026-03-15 125350.png')),
                transformation: { width: 550, height: 300 }
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({ 
            text: 'Figure 1: The Initial Dashboard Matrix connecting to the AWS Region.',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [ new TextRun({ text: 'Figure 1: The Initial Dashboard Matrix connecting to the AWS Region.', italics: true, color: "555555" }) ]
          }),
          
          // Image 2
          new Paragraph({
            children: [
              new ImageRun({
                data: fs.readFileSync(path.join(__dirname, 'assets', 'Screenshot png 1,2', 'Screenshot 2026-03-15 125403.png')),
                transformation: { width: 550, height: 300 }
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({ 
            text: 'Figure 2: Execution Log showing the provisioning of the t3.micro EC2 Instance.',
            alignment: AlignmentType.CENTER,
            children: [ new TextRun({ text: 'Figure 2: Active execution trace auto-provisioning the t3.micro server.', italics: true, color: "555555" }) ]
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, 'LinkedIn_Cloud_Monitoring_Project.docx');
  fs.writeFileSync(outPath, buffer);
  
  console.log('Professional Documentation created successfully at:', outPath);
}

createDocumentation().catch(console.error);
