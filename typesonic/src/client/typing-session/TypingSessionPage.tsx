import { useSession } from 'modelence/client';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

import { Page } from '@/client/layout/Page';
import { Card } from '@/client/ui/Card';
import { SpeedWidget } from '@/client/stats';
import { Typewriter } from '@/client/typewriter/Typewriter';
import { getTextLines } from '../text';

export default function TypingSessionPage() {
  const { id } = useParams();
  const { data: sessionData, refetch, isFetching, error } = useQuery(modelenceQuery('typingSession.getOwn', { id }));
  const [speed, setSpeed] = useState(null);

  if (isFetching) {
    return (
      <Page>
        <Card className="bg-gradient-to-br from-white to-orange-50 mt-12">
          <div className="text-center py-8">Loading...</div>
        </Card>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Card className="bg-gradient-to-br from-white to-orange-50 mt-12">
          <div className="text-center py-8 text-red-600">
            {error.message}
          </div>
        </Card>
      </Page>
    );
  }

  const { session, text } = sessionData as { session: any, text: string };

  return (
    <Page>
      <Card className="bg-gradient-to-br from-white to-orange-50">
        { session.status === 'active' && (
          <TypewriterArena text={text} speed={speed} setSpeed={setSpeed} onFinished={refetch} />
        )}
        { session.status === 'over' && (
          <TypingResults text={text} session={session} />
        )}
      </Card>
    </Page>
  );
}

function TypewriterArena({ text, speed, setSpeed, onFinished }: { text: string, speed: number, setSpeed: (speed: number) => void, onFinished: () => void }) {
  const { id } = useParams();

  const { mutateAsync: completeSession } = useMutation(modelenceMutation('typingSession.complete', { id }));

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <SpeedWidget speed={speed} />
      </div>
      <Typewriter
        text={text}
        onSpeed={setSpeed}
        onFinished={async () => {
          await completeSession({});
          onFinished();
        }}
      />
    </div>
  );
}

function TypingResults({ text, session }: { text: string, session: any }) {
  const { user } = useSession();
  
  const {
    data: analysis,
    mutateAsync: analyzeSession,
    isPending: isAnalyzing
  } = useMutation(modelenceMutation<string>('typingSession.analyze'));

  // For guests, there might not be a participant with a user ID
  // For authenticated users, find their participant record
  const participant = user?.id 
    ? session.participants.find((p: any) => p.userId === user.id)
    : null;
  const speed = participant?.speed ?? null;

  const handleAnalyze = async () => {
    await analyzeSession({
      sessionId: session._id,
      text,
      speed
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <SpeedWidget speed={speed} />
      </div>
      <div>The text you typed:</div>
      <div className="whitespace-pre-wrap font-mono">
        {getTextLines(text).map((line, index) => (
          <div key={index}>
            {line}
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t">
        {/* Only show analyze button for authenticated users */}
        {user?.id && !analysis && (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        )}
        
        {analysis && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-md">
            <h3 className="font-medium text-lg mb-2">AI Analysis</h3>
            <div className="prose prose-indigo">
              {analysis.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
