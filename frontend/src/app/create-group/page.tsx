'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import the group creation utility
import { createGroup } from '../../../supabase/groups'; 

// Import shared components
import RainbowText from '../../components/RainbowText';
import HanddrawnButton from '../../components/HanddrawnButton';

/**
 * Utility to generate a random, short, unique group code (e.g., ABCDE)
 * The check for *true* uniqueness is performed in groups.ts.
 */
const generateGroupCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};


export default function CreateGroupPage() {
    const router = useRouter();

    const [groupName, setGroupName] = useState('');
    const [groupCode, setGroupCode] = useState(generateGroupCode()); // Initial random code
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Function that handles the form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!groupName.trim()) {
            setError("Please enter a name for your group.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Call the robust createGroup function
            const newGroup = await createGroup(groupName, groupCode);

            // Success: Navigate to the dashboard (which will now show the group)
            router.push('/dashboard'); 
            
        } catch (err) {
            
            // This catch block handles the error thrown by groups.ts
            let errorMessage = "An unknown error occurred.";
            
            if (err instanceof Error) {
                errorMessage = err.message;

                // Handle the specific 'group code already in use' error
                if (errorMessage.includes("already in use")) {
                    // Give the user a new code to try immediately
                    setGroupCode(generateGroupCode()); 
                    errorMessage = `The code ${groupCode} was taken. A new one has been generated. Please try again.`;
                }
            }

            // Log full error details (replaces line 81 logic)
            console.error("Group creation error:", err); 
            setError(errorMessage);
            
        } finally {
            setIsSubmitting(false);
        }
        
    }, [groupName, groupCode, router]);
    
    // Function to generate a new code if the current one is unwanted
    const handleRegenerateCode = () => {
        setGroupCode(generateGroupCode());
        setError(null);
    };

    return (
        <div className="flex bg-pareto-dark min-h-screen items-center justify-center p-8">
            <main className="w-full max-w-xl">
                <h1 className="font-display text-pareto-light text-4xl text-center mb-10">
                    <RainbowText text="Create Your Group" className="text-4xl" />
                </h1>
                
                <div className="bg-pareto-light/10 p-8 rounded-xl border border-pareto-light/20">
                    <form onSubmit={handleSubmit}>
                        
                        {/* Group Name Input */}
                        <div className="mb-6">
                            <label htmlFor="groupName" className="chalk-text text-pareto-light block mb-2">
                                Group Name
                            </label>
                            <input
                                id="groupName"
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                required
                                className="w-full p-3 bg-pareto-dark/70 border border-pareto-light/30 text-pareto-light rounded-lg focus:ring-pareto-pink focus:border-pareto-pink"
                                placeholder="e.g., The Secret Santa Squad"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Group Code Display & Regeneration */}
                        <div className="mb-8">
                            <label htmlFor="groupCode" className="chalk-text text-pareto-light block mb-2">
                                Unique Group Code (Share this with members)
                            </label>
                            <div className="flex items-center space-x-3">
                                <p 
                                    className="p-3 font-mono text-xl bg-pareto-dark/70 border border-pareto-pink text-pareto-pink rounded-lg flex-grow text-center"
                                >
                                    {groupCode}
                                </p>
                                <HanddrawnButton
                                    text="Regenerate"
                                    fillColor="#39b16c"
                                    borderColor="#f6f1ee"
                                    textColor="#f6f1ee"
                                    type="button"
                                    onClick={handleRegenerateCode}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-6 chalk-text text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <HanddrawnButton
                            text={isSubmitting ? "Creating..." : "Create Group"}
                            fillColor="#ff7eba"
                            borderColor="#f6f1ee"
                            textColor="#15131c"
                            type="submit"
                            disabled={isSubmitting || !groupName.trim()}
                            className="w-full"
                        />
                    </form>

                    {/* Back to Dashboard Link */}
                    <div className="mt-6 text-center">
                        <Link href="/dashboard" passHref legacyBehavior>
                            <a className="chalk-text text-pareto-light/80 hover:text-pareto-light text-sm underline">
                                Back to Dashboard
                            </a>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}