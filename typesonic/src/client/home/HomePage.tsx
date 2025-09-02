"use client";

import { useSession } from 'modelence/client';
import { modelenceMutation } from '@modelence/react-query';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import * as React from 'react';

import { getTextLines } from '../text';

import { Page } from '../layout/Page';
import { Card } from '../ui/Card';

import { SpeedWidget } from '../stats';
import { Typewriter } from '../typewriter/Typewriter';

export default function HomePage() {
  const navigate = useNavigate();
  const { mutateAsync: createTypingSession, isPending } = useMutation(modelenceMutation('typingSession.create'));

  const handleEnter = async () => {
    const sessionId = await createTypingSession({});
    navigate(`/session/${sessionId}`);
  };

  return <Intro handleEnter={handleEnter} isFetching={isPending} />;

  // return <TypewriterArena />;
}

function Intro({ handleEnter, isFetching }: { handleEnter: () => void, isFetching: boolean }) {  
  return (
    <Page>
      {/* Hero Section with Speed Lines */}
      <div className="relative overflow-hidden">
        {/* Animated background speed lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="speed-line-1"></div>
            <div className="speed-line-2"></div>
            <div className="speed-line-3"></div>
            <div className="speed-line-4"></div>
          </div>
        </div>
        
        <div className="relative z-10">
          <Card className="bg-gradient-to-br from-blue-50 via-white to-orange-50 mt-8 border-2 border-orange-100 shadow-xl">
            <div className="max-w-4xl mx-auto py-16 px-6">
              {/* Header with Sonic Theme */}
              <div className="text-center space-y-6 mb-12">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse-slow">
                    <span className="text-white font-bold text-xl">⚡</span>
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                    Typesonic
                  </h1>
                </div>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Achieve <span className="font-semibold text-orange-600">supersonic typing speeds</span> with our AI-powered training platform
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <FeatureCard 
                  icon="🏃‍♂️" 
                  title="Speed Training" 
                  description="Build muscle memory with targeted exercises"
                />
                <FeatureCard 
                  icon="📊" 
                  title="Real-time Analytics" 
                  description="Track your progress with detailed insights"
                />
                <FeatureCard 
                  icon="🤖" 
                  title="AI Coaching" 
                  description="Get personalized feedback and tips"
                />
              </div>
              
              {/* Action Section */}
              <div className="text-center space-y-6">
                {isFetching ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    <span className="text-gray-600">Preparing your typing session...</span>
                  </div>
                ) : (
                  <UserActions handleEnter={handleEnter} />
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="text-center p-6 bg-white/50 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function UserActions({ handleEnter }: { handleEnter: () => void }) {
  const { user } = useSession();

  if (user) {
    return <ContinueAsUserButton handleEnter={handleEnter} />;
  }

  return (
    <div className="space-y-4">
      <SigninButton />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>
      <ContinueAsGuestButton handleEnter={handleEnter} />
    </div>
  );
}

function SigninButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/login')}
      className="group relative w-full px-6 py-4 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
    >
      <span className="relative z-10 flex items-center justify-center space-x-2">
        <span>🚀</span>
        <span>Sign in to track progress</span>
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}

function ContinueAsGuestButton({ handleEnter }: { handleEnter: () => void }) {
  return (
    <button
      onClick={handleEnter}
      className="group relative w-full px-6 py-4 text-orange-600 border-2 border-orange-500 rounded-xl font-semibold bg-white hover:bg-orange-50 transition-all duration-300 hover:scale-105 overflow-hidden"
    >
      <span className="relative z-10 flex items-center justify-center space-x-2">
        <span>⚡</span>
        <span>Continue as guest</span>
      </span>
      <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}

function ContinueAsUserButton({ handleEnter }: { handleEnter: () => void }) {
  return (
    <button
      onClick={handleEnter}
      className="group relative w-full px-6 py-4 text-white bg-gradient-to-r from-orange-500 to-blue-500 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
    >
      <span className="relative z-10 flex items-center justify-center space-x-2">
        <span>🏃‍♂️</span>
        <span>Start typing session</span>
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}
