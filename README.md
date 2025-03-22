# xtoxic

xtoxic is a Next.js application designed to analyze the toxicity levels of X accounts based on their recent tweets. This tool helps users understand the nature of the content shared by accounts they follow, providing insights into potential harmful behavior.

## Features

- **Toxicity Analysis**: Analyze the toxicity level of a Twitter account using the Exa API.
- **User-Friendly Interface**: Simple and intuitive UI for entering Twitter usernames.
- **Real-Time Feedback**: Instant analysis results with visual indicators of toxicity levels.
- **Responsive Design**: Works seamlessly on both desktop and mobile devices.

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (version 14 or later)
- npm, yarn, or another package manager of your choice

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/puang59/xtoxic
   cd xtoxic
   ```

2. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up your environment variables. Create a `.env.local` file in the root of the project and add your Exa API key:

   ```plaintext
   EXA_API_KEY=your_exa_api_key_here
   ```

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

### Usage

1. Enter a Twitter username (without the `@` symbol) in the input field.
2. Click the "Analyze" button to start the toxicity analysis.
3. View the results, including the toxicity level and a brief explanation of the findings.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## Credits

- inspired by [f1shy-dev](https://github.com/f1shy-dev).
