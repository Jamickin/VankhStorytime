<script>
	import {
		findConcepts,
		createConceptMappings,
		applyConceptMappings,
	} from "$lib/conceptParser.js";
	import {
		SAMPLE_STORY,
		THEME_PRESETS,
	} from "$lib/storyData.js";

	let storyText =
		SAMPLE_STORY;
	let foundConcepts =
		findConcepts(storyText);
	let conceptMappings =
		createConceptMappings(
			foundConcepts
		);
	let currentTheme =
		"futuristic";
	let showEditMode = false;

	// Apply theme preset
	function applyTheme(
		themeName
	) {
		currentTheme =
			themeName;
		const preset =
			THEME_PRESETS[
				themeName
			];
		conceptMappings = {
			...conceptMappings,
			...preset,
		};
	}

	// Get transformed story text and update concepts when mappings change
	$: {
		foundConcepts =
			findConcepts(
				storyText
			);
		transformedStory =
			applyConceptMappings(
				storyText,
				conceptMappings,
				foundConcepts
			);
	}

	// Edit mode toggle
	let editModeEnabled = false;

	// Modal state
	let showModal = false;
	let editingConcept = "";
	let editingText = "";
	let newValue = "";

	function toggleEditMode() {
		editModeEnabled =
			!editModeEnabled;
	}

	function saveStory() {
		const blob = new Blob(
			[transformedStory],
			{
				type: "text/plain",
			}
		);
		const url =
			URL.createObjectURL(
				blob
			);
		const a =
			document.createElement(
				"a"
			);
		a.href = url;
		a.download =
			"vankh-story-customized.txt";
		document.body.appendChild(
			a
		);
		a.click();
		document.body.removeChild(
			a
		);
		URL.revokeObjectURL(
			url
		);
	}

	function copyStory() {
		navigator.clipboard
			.writeText(
				transformedStory
			)
			.then(() => {
				alert(
					"Story copied to clipboard!"
				);
			})
			.catch(() => {
				alert(
					"Failed to copy story to clipboard"
				);
			});
	}

	function openEditModal(
		conceptKey,
		currentText
	) {
		editingConcept =
			conceptKey;
		editingText =
			currentText;
		newValue = currentText;
		showModal = true;

		// Focus the input after modal opens
		setTimeout(() => {
			const input =
				document.getElementById(
					"concept-input"
				);
			if (input) {
				input.focus();
				input.select();
			}
		}, 100);
	}

	function closeModal() {
		showModal = false;
		editingConcept = "";
		editingText = "";
		newValue = "";
	}

	function saveEdit() {
		if (
			newValue &&
			newValue !==
				editingText
		) {
			conceptMappings[
				editingConcept
			] = newValue;
			conceptMappings = {
				...conceptMappings,
			}; // Trigger reactivity
		}
		closeModal();
	}

	// Handle escape key to close modal
	function handleKeydown(
		event
	) {
		if (
			event.key ===
				"Escape" &&
			showModal
		) {
			closeModal();
		}
	}

	// Function to render paragraph with proper concept highlighting
	function renderParagraphWithHighlights(
		paragraph
	) {
		if (!editModeEnabled) {
			return paragraph; // No highlighting when edit mode disabled
		}

		let result = paragraph;

		// Find concepts in this paragraph and wrap them with spans
		foundConcepts.forEach(
			(concept) => {
				const currentValue =
					conceptMappings[
						concept
							.concept
					] ||
					concept.originalText;
				const regex =
					new RegExp(
						`\\b${currentValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
						"gi"
					);

				result =
					result.replace(
						regex,
						(match) => {
							return `<span 
		  class="inline-block transition-all duration-200 cursor-pointer bg-yellow-200 border-b-2 border-yellow-400 px-1 rounded hover:bg-yellow-300" 
		  onclick="editConcept('${concept.concept}', '${match}')"
		  title="Click to edit: ${concept.concept}"
		>${match}</span>`;
						}
					);
			}
		);

		return result;
	}

	// Function for editing concepts (client-side only)
	function editConcept(
		conceptKey,
		currentText
	) {
		if (editModeEnabled) {
			const newValue =
				prompt(
					`Edit "${conceptKey}":`,
					currentText
				);
			if (
				newValue &&
				newValue !==
					currentText
			) {
				conceptMappings[
					conceptKey
				] = newValue;
				conceptMappings =
					{
						...conceptMappings,
					}; // Trigger reactivity
			}
		}
	}

	// Make function available globally on client-side only
	import { browser } from "$app/environment";
	if (browser) {
		window.editConcept =
			editConcept;
	}
</script>

<svelte:window
	on:keydown={handleKeydown}
/>

<div
	class="min-h-screen bg-gray-50 p-6"
>
	<div
		class="max-w-4xl mx-auto"
	>
		<!-- Header -->
		<div class="mb-8">
			<h1
				class="text-4xl font-bold text-gray-900 mb-4"
			>
				VANKH: Interactive
				Story
			</h1>
			<p
				class="text-gray-600 mb-6"
			>
				Click "Edit Mode
				OFF" to start
				customizing story
				concepts. When
				highlighted words
				appear, click them
				to customize. Use
				Quick Themes for
				instant
				transformations,
				or create your own
				custom version!
			</p>

			<!-- Controls -->
			<div
				class="flex flex-wrap gap-4 mb-6"
			>
				<!-- Edit Mode Toggle -->
				<button
					class="px-4 py-2 rounded font-medium border-2 transition-colors
                 {editModeEnabled
						? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
						: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}"
					onclick={toggleEditMode}
				>
					{editModeEnabled
						? "✓ Edit Mode ON"
						: "Edit Mode OFF"}
					{#if editModeEnabled}
						<span
							class="text-xs ml-1"
							>({foundConcepts.length}
							concepts)</span
						>
					{/if}
				</button>

				<!-- Save Options -->
				{#if editModeEnabled}
					<div
						class="flex gap-2"
					>
						<button
							class="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
							onclick={saveStory}
							title="Download customized story as text file"
						>
							💾
							Download
						</button>
						<button
							class="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
							onclick={copyStory}
							title="Copy story to clipboard"
						>
							📋 Copy
						</button>
					</div>
				{/if}

				<!-- Theme Selector -->
				<div
					class="flex gap-2 items-center"
				>
					<span
						class="text-sm font-medium text-gray-700"
						>Quick
						Themes:</span
					>
					{#each Object.keys(THEME_PRESETS) as theme}
						<button
							class="px-3 py-1 rounded text-sm border-2 transition-colors
                     {currentTheme ===
							theme
								? 'border-blue-500 bg-blue-50 text-blue-700'
								: 'border-gray-300 hover:border-gray-400'}"
							onclick={() =>
								applyTheme(
									theme
								)}
						>
							{theme
								.charAt(
									0
								)
								.toUpperCase() +
								theme.slice(
									1
								)}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Story Display -->
		<div
			class="bg-white rounded-lg shadow-sm border p-8"
			onclick={handleConceptClick}
			onkeydown={(e) =>
				e.key ===
					"Enter" &&
				handleConceptClick(
					e
				)}
			role="button"
			tabindex="0"
		>
			<div
				class="prose prose-lg max-w-none leading-relaxed"
			>
				{#each transformedStory.split("\n\n") as paragraph}
					<p
						class="mb-4 text-gray-800 leading-relaxed"
					>
						{@html renderParagraphWithHighlights(
							paragraph
						)}
					</p>
				{/each}
			</div>
		</div>

		<!-- Edit Modal -->
		{#if showModal}
			<div
				class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
				onclick={closeModal}
				onkeydown={(e) =>
					e.key ===
						"Enter" &&
					closeModal()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				tabindex="0"
			>
				<div
					class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
					onclick={(e) =>
						e.stopPropagation()}
					onkeydown={(
						e
					) =>
						e.stopPropagation()}
					role="document"
					tabindex="0"
				>
					<h3
						id="modal-title"
						class="text-lg font-semibold text-gray-900 mb-4"
					>
						Edit
						Concept: <span
							class="text-blue-600"
							>{editingConcept}</span
						>
					</h3>

					<div
						class="mb-4"
					>
						<label
							for="concept-input"
							class="block text-sm font-medium text-gray-700 mb-2"
						>
							Current: <span
								class="font-normal text-gray-500"
								>"{editingText}"</span
							>
						</label>
						<input
							id="concept-input"
							type="text"
							bind:value={
								newValue
							}
							class="modal-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter new value..."
							onkeydown={(
								e
							) =>
								e.key ===
									"Enter" &&
								saveEdit()}
						/>
					</div>

					<div
						class="flex gap-3 justify-end"
					>
						<button
							class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
							onclick={closeModal}
						>
							Cancel
						</button>
						<button
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							onclick={saveEdit}
						>
							Save
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Debug Info (temporary) -->
		<div
			class="mt-8 p-4 bg-gray-100 rounded text-xs"
		>
			<details>
				<summary
					class="cursor-pointer font-medium"
					>Debug Info</summary
				>
				<div class="mt-2">
					<p>
						<strong
							>Found
							Concepts:</strong
						>
						{foundConcepts.length}
					</p>
					<p>
						<strong
							>Edit
							Mode:</strong
						>
						{editModeEnabled}
					</p>
					<p>
						<strong
							>Current
							Theme:</strong
						>
						{currentTheme}
					</p>
					<div
						class="mt-2"
					>
						<strong
							>Mappings:</strong
						>
						<pre
							class="text-xs mt-1 overflow-auto">{JSON.stringify(
								conceptMappings,
								null,
								2
							)}</pre>
					</div>
				</div>
			</details>
		</div>
	</div>
</div>

<style>
	kbd {
		font-family: ui-monospace,
			monospace;
	}
</style>
