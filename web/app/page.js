// pages/your-page-name.jsx
import Head from 'next/head';
import BacklogPanel from '../components/BacklogPanel'; // Adjust path
import SolutionPanel from '../components/SolutionPanel'; // Adjust path

export default function MyScrumPage() {
  return (
    <>
      <Head>
        <title>Scrum Board & Solution Graph</title>
        <meta name="description" content="Manage Backlogs and Solution Graph Nodes" />
      </Head>
      <main className="flex h-screen w-screen overflow-hidden">
        <BacklogPanel />
        <SolutionPanel />
      </main>
    </>
  );
}