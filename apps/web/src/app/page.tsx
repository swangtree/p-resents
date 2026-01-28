'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import HanddrawnButton from '@/components/HanddrawnButton';
import BlobBackground from '@/components/BlobBackground';
import RainbowText from '@/components/RainbowText';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex bg-pareto-dark min-h-screen">
      <Sidebar />

      <main className="ml-[200px] w-full">
        {/* Hero Section */}
        <section className="min-h-screen bg-pareto-dark flex items-center px-8 sm:px-16 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12">
            {/* Left: Tagline and Buttons */}
            <div className="flex-1 max-w-2xl">
              <h1 className="font-display text-pareto-light text-3xl sm:text-4xl lg:text-5xl mb-8 leading-tight">
                Helping you and your friends gift give (more optimally) !!
              </h1>

              <p className="chalk-text text-pareto-light/80 text-base sm:text-lg mb-8">
                Say goodbye to awkward gift exchanges. Use smart algorithms to match givers 
                with receivers based on preferences, interests, and compatibility.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <HanddrawnButton
                  text="Sign In"
                  fillColor="#39b16c"
                  borderColor="#f6f1ee"
                  textColor="#f6f1ee"
                  onClick={() => router.push('/login')}
                />
                <HanddrawnButton
                  text="View Demo"
                  fillColor="#f9df57"
                  borderColor="#15131c"
                  textColor="#15131c"
                  onClick={() => router.push('/demo')}
                />
                <HanddrawnButton
                  text="Learn More"
                  fillColor="#ff7eba"
                  borderColor="#f6f1ee"
                  textColor="#f6f1ee"
                  onClick={() => router.push('/about')}
                />
              </div>
            </div>

            {/* Right: SVG Illustration */}
            <div className="flex-1 flex justify-center max-w-xl">
              <Image
                src="/assets/group1.svg"
                alt="Gift exchange illustration"
                width={500}
                height={500}
                priority
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* What is Pareto Presents Section */}
        <section className="relative min-h-screen bg-pareto-yellow px-8 sm:px-16 py-12">
          <BlobBackground fillColor="#f6f1ee" />
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="max-w-5xl">
              <h2 className="font-display text-text-dark text-4xl sm:text-5xl md:text-6xl mb-8">
                What is Pareto Presents??
              </h2>
              
              <div className="space-y-6 chalk-text text-text-dark text-base sm:text-lg">
                <p>
                  Pareto Presents is a smart gift exchange platform that uses algorithms 
                  to create optimal matches between gift givers and receivers.
                </p>
                
                <p>
                  Named after the Pareto efficiency principle, our system helps groups 
                  achieve better outcomes where no one can be made happier without 
                  making someone else less happy.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/50 rounded-xl p-6">
                    <h3 className="font-display text-2xl text-pareto-pink mb-3">
                      Multiple Algorithms
                    </h3>
                    <p className="text-sm">
                      Choose from Random Matching, Max Utility (best overall matches), 
                      Max Fairness (most equal happiness), or White Elephant simulation.
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-6">
                    <h3 className="font-display text-2xl text-pareto-orange mb-3">
                      Preference Based
                    </h3>
                    <p className="text-sm">
                      Users input giving and receiving preferences on practicality, 
                      novelty, and sentimentality, plus interests and exclusions.
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-6">
                    <h3 className="font-display text-2xl text-pareto-green mb-3">
                      Admin Dashboard
                    </h3>
                    <p className="text-sm">
                      Group creators can calculate statistics, compare algorithms, 
                      and finalize the perfect matching for their group.
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-6">
                    <h3 className="font-display text-2xl text-pareto-blue mb-3">
                      Privacy First
                    </h3>
                    <p className="text-sm">
                      Results are only revealed after finalization, and users only 
                      see their own match to preserve the surprise!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative min-h-screen bg-pareto-pink px-8 sm:px-16 py-12">
          <BlobBackground fillColor="#f6f1ee" />
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="max-w-5xl">
              <h2 className="font-display text-text-dark text-4xl sm:text-5xl md:text-6xl mb-12">
                How It Works
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-pareto-green rounded-full flex items-center justify-center">
                    <span className="font-display text-white text-3xl">1</span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-text-dark mb-2">
                      Create or Join a Group
                    </h3>
                    <p className="chalk-text text-text-dark text-base">
                      Start by creating a new gift exchange group or join an existing 
                      one with a group code. Perfect for families, friends, or coworkers!
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-pareto-yellow rounded-full flex items-center justify-center">
                    <span className="font-display text-text-dark text-3xl">2</span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-text-dark mb-2">
                      Fill Out Preferences
                    </h3>
                    <p className="chalk-text text-text-dark text-base">
                      Tell us your giving style and receiving preferences on a 1-5 scale. 
                      Add interests and specify anyone you shouldn&apos;t be matched with.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-pareto-orange rounded-full flex items-center justify-center">
                    <span className="font-display text-white text-3xl">3</span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-text-dark mb-2">
                      Admin Runs Algorithm
                    </h3>
                    <p className="chalk-text text-text-dark text-base">
                      The group creator calculates statistics for all algorithms, 
                      compares performance, and chooses the best one for the group.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-pareto-blue rounded-full flex items-center justify-center">
                    <span className="font-display text-white text-3xl">4</span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-text-dark mb-2">
                      Get Your Match!
                    </h3>
                    <p className="chalk-text text-text-dark text-base">
                      Once finalized, everyone receives their match! For Secret Santa, 
                      you&apos;ll see who you&apos;re giving to. For White Elephant, you&apos;ll see 
                      your position in the play order.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <HanddrawnButton
                  text="Get Started"
                  fillColor="#39b16c"
                  borderColor="#15131c"
                  textColor="#15131c"
                  onClick={() => router.push('/login')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="min-h-[50vh] bg-pareto-dark flex items-center justify-center px-8 sm:px-16 py-12">
          <div className="max-w-4xl text-center">
            <RainbowText 
              text="Ready to Make Gift Giving Better?" 
              className="text-3xl sm:text-4xl md:text-5xl mb-6"
            />
            <p className="chalk-text text-pareto-light/80 text-lg mb-8">
              Join thousands using algorithms to create happier gift exchanges
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <HanddrawnButton
                text="Sign Up Free"
                fillColor="#ff7eba"
                borderColor="#f6f1ee"
                textColor="#f6f1ee"
                onClick={() => router.push('/login')}
              />
              <HanddrawnButton
                text="Sign In"
                fillColor="#6caade"
                borderColor="#f6f1ee"
                textColor="#f6f1ee"
                onClick={() => router.push('/login')}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}