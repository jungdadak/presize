"use client";
import React, { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

const HomeBots = () => {
	const [dragActive, setDragActive] = useState(false);

	return (
		<div className="md:mt-32 min-h-screen bg-gradient-to-b from-purple-100 dark:from-purple-900 via-white dark:via-black to-white dark:to-black text-gray-800 dark:text-white">
			{/* Hero Section with Background Image */}
			<div className="relative overflow-hidden">
				<div
					className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
					style={{ backgroundImage: 'url("/bgtemp.jpg")' }}
				/>
				<div className="absolute inset-0 bg-white/40 dark:bg-black/50" />

				<div className="relative z-10 max-w-6xl mx-auto px-4 py-24">
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
							Transform Your Images with
							<span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-400 dark:to-pink-400">
								AI Upscaling
							</span>
						</h1>
						<p className="text-xl text-white dark:text-gray-200 max-w-2xl mx-auto font-medium">
							Enhance image quality, increase resolution, and remove noise with our
							advanced AI technology. Get professional results in seconds.
						</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className="max-w-6xl mx-auto px-4 -mt-20 md:mt-20">
				{/* Upload Section */}
				<div className="max-w-4xl mx-auto">
					<div
						className={`border-2 border-dashed rounded-xl p-12 text-center transition-all backdrop-blur-sm
              ${
															dragActive
																? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
																: "border-gray-300 dark:border-gray-600 hover:border-purple-400 bg-white/90 dark:bg-gray-900/80"
														}`}
						onDragEnter={() => setDragActive(true)}
						onDragLeave={() => setDragActive(false)}
						onDrop={() => setDragActive(false)}
					>
						<Upload className="w-16 h-16 mx-auto mb-4 text-purple-500 dark:text-purple-400" />
						<h3 className="text-xl font-semibold mb-2">
							Drag & Drop your image here
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-6">or</p>
						<button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-all">
							Choose File
						</button>
						<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
							Supports JPG, PNG - Max file size 10MB
						</p>
					</div>
				</div>

				{/* Features Section */}
				<div className="grid md:grid-cols-3 gap-8 mt-24">
					<div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900">
						<ImageIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-4" />
						<h3 className="text-xl font-semibold mb-2">4x Upscaling</h3>
						<p className="text-gray-500 dark:text-gray-400">
							Increase image resolution up to 4 times while maintaining quality
						</p>
					</div>
					<div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900">
						<ImageIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-4" />
						<h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
						<p className="text-gray-500 dark:text-gray-400">
							Advanced AI algorithms to improve clarity and detail
						</p>
					</div>
					<div className="p-6 rounded-xl bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/50 dark:to-transparent backdrop-blur-sm border border-purple-100 dark:border-purple-900">
						<ImageIcon className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-4" />
						<h3 className="text-xl font-semibold mb-2">Batch Processing</h3>
						<p className="text-gray-500 dark:text-gray-400">
							Process multiple images at once with our batch upscaling feature
						</p>
					</div>
				</div>

				{/* Example Section */}
				<div className="mt-24">
					<h2 className="text-3xl font-bold text-center mb-12">Before & After</h2>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="rounded-lg overflow-hidden bg-white shadow-lg dark:bg-gray-800/50">
							<ImageIcon />
							<p className="text-center mt-2 text-gray-500 dark:text-gray-400">
								Before
							</p>
						</div>
						<div className="rounded-lg overflow-hidden bg-white shadow-lg dark:bg-gray-800/50">
							<ImageIcon />
							<p className="text-center mt-2 text-gray-500 dark:text-gray-400">
								After
							</p>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="text-center py-8 text-gray-500 dark:text-gray-400 mt-24">
				<p>© 2024 PicOps. All rights reserved.</p>
			</footer>
		</div>
	);
};

export default HomeBots;
