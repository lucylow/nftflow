import React from 'react';
import { Container } from '@/components/ui/container';
import { AIAgentDashboard } from '@/components/AIAgentDashboard';

const AIAgentsPage: React.FC = () => {
  return (
    <Container className="py-8">
      <AIAgentDashboard />
    </Container>
  );
};

export default AIAgentsPage;
