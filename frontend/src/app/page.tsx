import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import HanddrawnButton from "@/components/HanddrawnButton";
import BlobBackground from "@/components/BlobBackground";

export default function Home() {
  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area - offset by sidebar width */}
      <main className="ml-[200px] w-full">
        {/* Hero Section */}
        <section className="min-h-screen bg-pareto-dark flex items-center px-16 py-12">
          <div className="flex items-center justify-between w-full gap-12">
            {/* Left: Tagline and Buttons */}
            <div className="flex-1">
              <h1 className="font-display text-pareto-light text-4xl mb-8 leading-tight">
                Helping you and your friends gift give (more optimally) !!
              </h1>

              <div className="flex gap-4">
                <HanddrawnButton
                  text="Create a group"
                  fillColor="#ff7eba"
                  borderColor="#f6f1ee"
                  textColor="#f6f1ee"
                />
                <HanddrawnButton
                  text="Join a Group"
                  fillColor="#39b16c"
                  borderColor="#f6f1ee"
                  textColor="#f6f1ee"
                />
              </div>
            </div>

            {/* Right: SVG Illustration */}
            <div className="flex-1 flex justify-center">
              <Image
                src="/assets/group1.svg"
                alt="Gift exchange illustration"
                width={500}
                height={500}
                priority
              />
            </div>
          </div>
        </section>

        {/* What is Pareto Presents Section */}
        <section className="relative min-h-screen bg-pareto-yellow px-16 py-12">
          <BlobBackground fillColor="#f6f1ee" />
            <div className="relative z-10 flex items-center justify-center min-h-screen">
              <div className="max-w-5xl">
                <h2 className="font-display text-text-dark text-6xl mb-8">
                  What is Pareto Presents??
                </h2>
                <p className="font-sans text-text-dark text-xl">
                  Content coming soon...
                </p>
              </div>
            </div>
        </section>

        {/* Example Results Section */}
        <section className="relative min-h-screen bg-pareto-pink px-16 py-12">
          <BlobBackground fillColor="#f6f1ee" />
            <div className="relative z-10 flex items-center justify-center min-h-screen">
              <div className="max-w-5xl">
                <h2 className="font-display text-text-dark text-6xl mb-8">
                  Our results :0
                </h2>
                <p className="font-sans text-text-dark text-xl">
                  Content coming soon...
                </p>
              </div>
            </div>
        </section>
      </main>
    </div>
  );
}
