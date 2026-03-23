<script>
	import ChatPanel from "$lib/components/ChatPanel.svelte";
	import PreviewPanel from "$lib/components/PreviewPanel.svelte";
	import AssetsPanel from "$lib/components/AssetsPanel.svelte";

	let step = "IDEA_INPUT";
	let messages = [
		{
			role: "ai",
			content:
				"Hey there.\n\nI'm your AI Brand Architect — think of me as your creative director for this project.\n\nTell me about the business, product, or idea you want to build a brand for. Even a rough concept works — we'll shape it together.",
		},
	];
	let brandData = {
		idea: "",
		name: "",
		tagline: "",
		industry: "",
		inspirations: [],
		inspirationAnalyses: [],
		brandDNA: null,
		brandId: null,
		nameOptions: null,
		moodboards: null,
		selectedMoodboard: null,
		logos: null,
		guidelines: null,
		assets: null,
		brandPackage: null,
		wireframe: null,
		socialCampaigns: null,
		regenCounts: { names: 0, moodboards: 0, logos: 0, guidelines: 0, wireframe: 0, socialCampaigns: 0 },
	};
	let isLoading = false;

	function handleSendMessage(msg) {
		if (isLoading) return;
		messages = [...messages, { role: "user", content: msg }];
		progressWorkflow(msg);
	}

	async function progressWorkflow(userMsg) {
		isLoading = true;
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ step, message: userMsg, brandData }),
			});
			const data = await res.json();

			if (step === "IDEA_INPUT") {
				if (data.nextStep === "IDEA_INPUT") {
					messages = [
						...messages,
						{ role: "ai", content: data.content },
					];
				} else {
					brandData.idea = userMsg;
					step = "INSPIRATION_UPLOAD";
					messages = [
						...messages,
						{
							role: "ai",
							content: data.content,
							showInspirationUpload: true,
						},
					];
				}
			} else if (step === "INSPIRATION_UPLOAD") {
				brandData.brandDNA = data.brandDNA;
				brandData.brandId = data.brandId;
				brandData.nameOptions = data.names;
				step = "NAME_SELECTION";
				messages = [
					...messages,
					{
						role: "ai",
						content: data.content,
						nameOptions: data.names,
					},
				];
			} else if (step === "NAME_SELECTION") {
				brandData.name = userMsg;
				brandData.moodboards = data.moodboards;
				step = "MOODBOARD_SELECTION";
				messages = [...messages, { role: "ai", content: data.content }];
			} else if (step === "MOODBOARD_SELECTION") {
				brandData.logos = data.logos;
				brandData.guidelines = data.guidelines;
				brandData.assets = data.assets;
				brandData.brandPackage = data.brandPackage;
				brandData.wireframe = data.wireframe;
				brandData.socialCampaigns = data.socialCampaigns;
				step = "DONE";
				messages = [...messages, { role: "ai", content: data.content }];
			} else if (step === "DONE") {
				messages = [...messages, { role: "ai", content: data.content }];
			}
		} catch (e) {
			console.error("Error:", e);
			messages = [
				...messages,
				{
					role: "ai",
					content: "Something went wrong. Please try again.",
				},
			];
		} finally {
			isLoading = false;
		}
	}

	async function handleInspirationSubmit(inspirations) {
		if (isLoading) return;
		brandData.inspirations = inspirations;
		messages = [
			...messages,
			{
				role: "user",
				content: `Added ${inspirations.length} inspiration(s)`,
			},
		];

		isLoading = true;
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					step: "INSPIRATION_UPLOAD",
					message: "",
					brandData,
				}),
			});
			const data = await res.json();
			brandData.brandDNA = data.brandDNA;
			brandData.brandId = data.brandId;
			brandData.nameOptions = data.names;
			step = "NAME_SELECTION";
			messages = [
				...messages,
				{
					role: "ai",
					content: data.content,
					nameOptions: data.names,
				},
			];
		} catch (e) {
			console.error("Inspiration error:", e);
			messages = [
				...messages,
				{
					role: "ai",
					content: "Failed to analyze inspirations. Try again.",
				},
			];
		} finally {
			isLoading = false;
		}
	}

	function handleSelectName(name) {
		if (step !== "NAME_SELECTION") return;
		handleSendMessage(name.name);
	}

	async function handleSelectMoodboard(moodboard) {
		if (step !== "MOODBOARD_SELECTION") return;
		brandData.selectedMoodboard = moodboard;
		messages = [
			...messages,
			{
				role: "user",
				content: `I choose: ${moodboard.name}`,
			},
		];

		isLoading = true;
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					step: "MOODBOARD_SELECTION",
					message: moodboard.name,
					brandData,
				}),
			});
			const data = await res.json();
			brandData.logos = data.logos;
			brandData.guidelines = data.guidelines;
			brandData.assets = data.assets;
			brandData.brandPackage = data.brandPackage;
			brandData.wireframe = data.wireframe;
			brandData.socialCampaigns = data.socialCampaigns;
			step = "DONE";
			messages = [...messages, { role: "ai", content: data.content }];
		} catch (e) {
			console.error("Finalize error:", e);
			step = "DONE";
			messages = [
				...messages,
				{
					role: "ai",
					content:
						"Brand finalized with some issues. Check available assets.",
				},
			];
		} finally {
			isLoading = false;
		}
	}

	async function handleRegenerate(type) {
		isLoading = true;
		try {
			const res = await fetch("/api/regenerate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type,
					brandDNA: brandData.brandDNA,
					brandName: brandData.name,
					brandId: brandData.brandId,
				}),
			});
			const data = await res.json();

			if (data.error) {
				messages = [...messages, { role: "ai", content: data.error }];
				return;
			}

			if (type === "names") brandData.nameOptions = data.result;
			if (type === "moodboards") brandData.moodboards = data.result;
			if (type === "logos") brandData.logos = data.result;
			if (type === "guidelines") brandData.guidelines = data.result;
			if (type === "wireframe") brandData.wireframe = data.result;
			if (type === "socialCampaigns") brandData.socialCampaigns = data.result;
			brandData.regenCounts[type] =
				(brandData.regenCounts[type] || 0) + 1;
			brandData = brandData;

			messages = [
				...messages,
				{
					role: "ai",
					content: `Regenerated ${type}! ${data.remaining} regeneration(s) left.`,
				},
			];
		} catch (e) {
			console.error("Regen error:", e);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head><title>AI Brand Builder v2.0</title></svelte:head>

<div class="flex w-screen h-screen overflow-hidden bg-bg">
	<ChatPanel
		{messages}
		{step}
		{isLoading}
		onSendMessage={handleSendMessage}
		onInspirationSubmit={handleInspirationSubmit}
		onSelectName={handleSelectName}
	/>
	<PreviewPanel
		{step}
		{brandData}
		onSelectMoodboard={handleSelectMoodboard}
		onRegenerate={handleRegenerate}
	/>
	<AssetsPanel {step} {brandData} onRegenerate={handleRegenerate} />
</div>
