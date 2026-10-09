"use strict";

    const fileInput = document.getElementById("file-input");
    const dropzone = document.getElementById("dropzone");
    const fileList = document.getElementById("file-list");
    const searchInput = document.getElementById("search-input");
    const sortSelect = document.getElementById("sort-select");
    const voiceStatus = document.getElementById("voice-status");
    const loginPage = document.getElementById("login-page");
    const landingPage = document.getElementById("landing-page");
    const workspacePage = document.getElementById("workspace-page");
    const demoLoginForm = document.getElementById("demo-login-form");
    const demoEmail = document.getElementById("demo-email");
    const demoPassword = document.getElementById("demo-password");
    const demoLoginStatus = document.getElementById("demo-login-status");
    const headerAction = document.getElementById("header-action");
    const treasureWidget = document.getElementById("treasure-widget");
    const treasureButton = document.getElementById("treasure-button");
    const coinTotal = document.getElementById("coin-total");
    const coinCount = document.getElementById("coin-count");
    const coinBurst = document.getElementById("coin-burst");
    const writerForm = document.getElementById("writer-form");
    const writerTopic = document.getElementById("writer-topic");
    const writerType = document.getElementById("writer-type");
    const writerPages = document.getElementById("writer-pages");
    const writerResult = document.getElementById("writer-result");
    const writerConversation = document.getElementById("writer-conversation");
    const clearWriterChat = document.getElementById("clear-writer-chat");
    const writerChatStatus = document.getElementById("writer-chat-status");
    const draftTitle = document.getElementById("draft-title");
    const draftPreview = document.getElementById("draft-preview");
    const downloadDraft = document.getElementById("download-draft");
    const writerDownloadStatus = document.getElementById("writer-download-status");
    const voiceAssistantToggle = document.getElementById("voice-assistant-toggle");
    const voiceAssistant = document.getElementById("voice-assistant");
    const voiceAssistantClose = document.getElementById("voice-assistant-close");
    const voiceChatMessages = document.getElementById("voice-chat-messages");
    const voiceAssistantStatus = document.getElementById("voice-assistant-status");
    const voiceChatForm = document.getElementById("voice-chat-form");
    const voiceChatInput = document.getElementById("voice-chat-input");
    const voiceMicButton = document.getElementById("voice-mic-button");
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    let speechRecognition = null;
    let assistantWelcomed = false;
    let currentDraft = "";
    let currentDraftFilename = "";
    let demoAccessGranted = false;

    demoLoginForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!demoEmail.value.trim() || !demoPassword.value) {
        demoLoginStatus.textContent = "Enter any non-empty email and password to continue.";
        return;
      }
      demoAccessGranted = true;
      demoPassword.value = "";
      demoLoginStatus.textContent = "";
      headerAction.hidden = false;
      voiceAssistantToggle.hidden = false;
      treasureWidget.hidden = false;
      showPage("home");
    });

    function addVoiceMessage(text, role) {
      const message = document.createElement("div");
      message.className = `voice-chat-message ${role}`;
      message.textContent = text;
      voiceChatMessages.append(message);
      voiceChatMessages.scrollTop = voiceChatMessages.scrollHeight;
    }

    function speakAssistantReply(text) {
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        voiceAssistantStatus.textContent = "Text help is ready, but speech output is not supported in this browser.";
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = document.documentElement.lang || "en";
      utterance.rate = 1;
      utterance.onstart = () => {
        voiceAssistantStatus.textContent = "Speaking…";
      };
      utterance.onend = () => {
        voiceAssistantStatus.textContent = SpeechRecognitionApi
          ? "You can type a question or tap the microphone to speak."
          : "You can type another question. Speech input is not supported in this browser.";
      };
      utterance.onerror = event => {
        if (event.error !== "canceled" && event.error !== "interrupted") {
          voiceAssistantStatus.textContent = "I couldn't start speech. You can still read and type here.";
        }
      };
      window.speechSynthesis.speak(utterance);
    }

    function openVoiceAssistant() {
      voiceAssistant.hidden = false;
      document.body.classList.add("voice-open");
      voiceAssistantToggle.setAttribute("aria-expanded", "true");
      voiceAssistantClose.focus();
      if (!assistantWelcomed) {
        const greeting = "Hi! I'm Briefly's voice helper. I can guide you through uploading and summarizing files, listening to summaries, or making a document draft.";
        addVoiceMessage(greeting, "assistant");
        assistantWelcomed = true;
        speakAssistantReply(greeting);
      }
    }

    function closeVoiceAssistant() {
      if (speechRecognition) speechRecognition.stop();
      voiceAssistant.hidden = true;
      document.body.classList.remove("voice-open");
      voiceAssistantToggle.setAttribute("aria-expanded", "false");
      voiceAssistantToggle.focus();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }

    function answerVoiceQuestion(question) {
      const normalized = question.toLowerCase();
      let answer;

      if (/\b(create|write|generate|draft|make)\b/.test(normalized) && /\b(document|report|guide|proposal|story|file|page|draft)\b/.test(normalized)) {
        answer = "I’ll take you to Briefly Writer. Enter your topic, choose a format and page count, then create and download a structured draft. It uses local templates, not a connected AI service.";
        if (workspacePage.hidden === false) showPage("home");
        document.getElementById("writer-title").scrollIntoView({ behavior: "smooth", block: "center" });
        return answer;
      }
      if (/\b(upload|add|open|choose)\b/.test(normalized) && /\b(file|files|document|documents|pdf|word)\b/.test(normalized)) {
        answer = "Open the workspace using the button in the header. Choose files or drop them in the upload area. Briefly can read PDFs, Word documents, text, Markdown, CSV, JSON, and HTML.";
        if (workspacePage.hidden) showPage("workspace");
        return answer;
      }
      if (/\b(summar|summary|summaries|page by page|key points)\b/.test(normalized)) {
        answer = "Upload a document in the workspace and Briefly will create a quick overview. PDFs also get page-by-page takeaways. Open a document's page summaries to read or listen to them.";
        if (workspacePage.hidden) showPage("workspace");
        return answer;
      }
      if (/\b(listen|read aloud|voice|speak)\b/.test(normalized)) {
        answer = "After you upload a readable document, use its Listen button to hear the summary. Your browser provides the voice.";
        if (workspacePage.hidden) showPage("workspace");
        return answer;
      }
      if (/\b(search|find)\b/.test(normalized)) {
        answer = "In the workspace, use the search box above your document list to find words across uploaded files. You can sort the results by relevance, name, or size.";
        if (workspacePage.hidden) showPage("workspace");
        return answer;
      }
      if (/\b(clear|delete|remove)\b/.test(normalized) && /\b(chat|draft|conversation)\b/.test(normalized)) {
        answer = "In Briefly Writer, choose Clear chat to remove the current conversation and draft and reset the form.";
        if (workspacePage.hidden) {
          showPage("home");
          window.setTimeout(() => document.getElementById("writer-title").scrollIntoView({ behavior: "smooth", block: "center" }), 200);
        }
        return answer;
      }
      if (/^(hi|hello|hey)\b/.test(normalized)) {
        answer = "Hello! I can help with uploading files, summaries, search, listening, or creating a document draft. What would you like to do?";
        return answer;
      }
      answer = "I can help you use Briefly: ask me how to upload files, summarize or search documents, listen to a summary, or create a draft. I provide local guidance rather than answers from a connected AI.";
      return answer;
    }

    function submitVoiceQuestion(question) {
      const cleanedQuestion = question.trim();
      if (!cleanedQuestion) return;
      addVoiceMessage(cleanedQuestion, "user");
      voiceChatInput.value = "";
      const answer = answerVoiceQuestion(cleanedQuestion);
      addVoiceMessage(answer, "assistant");
      speakAssistantReply(answer);
    }

    voiceAssistantToggle.addEventListener("click", () => {
      if (voiceAssistant.hidden) openVoiceAssistant();
      else closeVoiceAssistant();
    });
    voiceAssistantClose.addEventListener("click", closeVoiceAssistant);
    voiceChatForm.addEventListener("submit", event => {
      event.preventDefault();
      submitVoiceQuestion(voiceChatInput.value);
    });
    voiceMicButton.addEventListener("click", () => {
      if (!SpeechRecognitionApi) {
        voiceAssistantStatus.textContent = "Speech input is not supported in this browser. Type your question instead.";
        return;
      }
      if (speechRecognition) speechRecognition.stop();
      speechRecognition = new SpeechRecognitionApi();
      speechRecognition.lang = document.documentElement.lang || "en";
      speechRecognition.interimResults = false;
      speechRecognition.maxAlternatives = 1;
      voiceMicButton.classList.add("listening");
      voiceMicButton.setAttribute("aria-label", "Stop listening");
      voiceAssistantStatus.textContent = "Listening… speech recognition may be processed by your browser provider.";
      speechRecognition.onresult = event => {
        const transcript = event.results[0][0].transcript;
        submitVoiceQuestion(transcript);
      };
      speechRecognition.onerror = event => {
        voiceAssistantStatus.textContent = event.error === "not-allowed"
          ? "Microphone access was denied. Allow microphone access in your browser, or type your question."
          : `Speech recognition error (${event.error}). You can type your question instead.`;
      };
      speechRecognition.onend = () => {
        voiceMicButton.classList.remove("listening");
        voiceMicButton.setAttribute("aria-label", "Ask by voice");
      };
      try {
        speechRecognition.start();
      } catch (error) {
        voiceMicButton.classList.remove("listening");
        voiceMicButton.setAttribute("aria-label", "Ask by voice");
        voiceAssistantStatus.textContent = `Could not start speech recognition: ${error instanceof Error ? error.message : "browser unavailable"}`;
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !voiceAssistant.hidden) closeVoiceAssistant();
    });

    clearWriterChat.addEventListener("click", () => {
      writerForm.reset();
      writerTopic.setCustomValidity("");
      writerConversation.replaceChildren();
      writerResult.hidden = true;
      draftTitle.textContent = "";
      draftPreview.textContent = "";
      writerDownloadStatus.textContent = "";
      writerChatStatus.textContent = "Chat cleared. Start a new draft whenever you’re ready.";
      currentDraft = "";
      currentDraftFilename = "";
      clearWriterChat.disabled = true;
    });
    const documents = [];
    const expandedPageBreakdowns = new Set();
    const stopWords = new Set(("a an and are as at be been but by can did do does for from had has have he her hers him his how i if in into is it its me my no not of on or our ours she so than that the their them then there these they this those to up us was we were what when where which who will with you your").split(" "));
    let nextId = 1;
    let activeSpeechKey = "";
    let totalCoins = 0;
    let treasureClicks = 0;
    let burstTimeout;

    const treasureCorners = ["corner-top-left", "corner-top-right", "corner-bottom-left", "corner-bottom-right"];
    treasureWidget.classList.add(treasureCorners[Math.floor(Math.random() * treasureCorners.length)]);

    treasureButton.addEventListener("click", () => {
      const reward = Math.floor(Math.random() * 5) + 1;
      treasureClicks += 1;
      const isLuckyClick = treasureClicks === 5 || treasureClicks === 10;
      totalCoins += reward;
      coinCount.textContent = totalCoins.toLocaleString();
      coinTotal.hidden = false;
      treasureWidget.classList.remove("is-opening");
      void treasureButton.offsetWidth;
      treasureWidget.classList.add("is-opening");

      coinBurst.replaceChildren();
      for (let index = 0; index < 7; index++) {
        const coin = document.createElement("span");
        const angle = (Math.PI * 2 * index) / 7;
        const distance = 34 + Math.random() * 25;
        coin.className = "coin-spark";
        coin.style.setProperty("--coin-x", `${Math.cos(angle) * distance}px`);
        coin.style.setProperty("--coin-y", `${Math.sin(angle) * distance - 15}px`);
        coin.style.animationDelay = `${Math.random() * 0.12}s`;
        coinBurst.append(coin);
      }

      const rewardLabel = document.createElement("span");
      rewardLabel.className = `coin-reward${isLuckyClick ? " lucky-reward" : ""}`;
      rewardLabel.textContent = isLuckyClick ? `Good luck! +${reward} coins` : `+${reward} coins`;
      coinBurst.append(rewardLabel);

      window.clearTimeout(burstTimeout);
      burstTimeout = window.setTimeout(() => {
        treasureWidget.classList.remove("is-opening");
        coinBurst.replaceChildren();
      }, 1200);
    });

    function showPage(page) {
      if (!demoAccessGranted) {
        loginPage.hidden = false;
        landingPage.hidden = true;
        workspacePage.hidden = true;
        return;
      }
      const showWorkspace = page === "workspace";
      loginPage.hidden = true;
      landingPage.hidden = showWorkspace;
      workspacePage.hidden = !showWorkspace;
      headerAction.textContent = showWorkspace ? "Back to overview" : "Open workspace";
      headerAction.setAttribute("aria-label", showWorkspace ? "Back to overview" : "Open document workspace");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const draftProfiles = {
      report: {
        label: "Professional report",
        sections: ["Executive overview", "Background and context", "Key considerations", "Analysis and options", "Recommendations", "Implementation plan", "Measuring progress", "Conclusion"],
        focus: ["scope and stakeholders", "available evidence", "evaluation criteria", "alternatives and trade-offs", "recommended actions", "delivery and ownership", "outcomes and indicators", "decisions and open questions"],
        paragraphs(topic, section, page) {
          return [
            `This page focuses on ${section.toLowerCase()} for ${topic}. Start by describing the current situation, the people affected, and the reason this subject deserves attention. Separate confirmed information from assumptions, and add relevant examples or research to ground the discussion.`,
            `For ${this.focus[page]}, consider how different perspectives shape the discussion of ${topic}. Use consistent criteria such as impact, effort, accessibility, and long-term value. Support specific claims with evidence, and make uncertainty visible rather than implying a certainty the available information does not provide.`,
            `Turn the findings about ${this.focus[page]} into a clear next step. Name an owner, set a review point, and record risks or dependencies that could change the outcome. Use the next section to build on these findings${page > 0 ? " and connect them to the previous analysis" : ""}.`
          ];
        }
      },
      guide: {
        label: "Practical guide",
        sections: ["Getting oriented", "Start with the essentials", "Your first steps", "Build a steady routine", "Tools and resources", "Common challenges", "Level up your approach", "Keep going"],
        focus: ["your starting point and goal", "preparing what you need", "a manageable first attempt", "a practice you can repeat", "choosing helpful tools", "solving a common setback", "improving with experience", "planning what comes next"],
        paragraphs(topic, section, page) {
          return [
            `Use this section to work on ${topic} at a manageable pace. Begin with ${section.toLowerCase()}: decide what you want to achieve, check what you already know, and gather the tools or information you will need. A small, clear goal makes it easier to get started.`,
            `Focus on ${this.focus[page]}. Break ${topic} into a few concrete actions, then choose the smallest useful one to try first. Keep notes on what helped, adapt the approach to your own situation, and add more complexity only when it solves a real problem.`,
            `Before moving on from ${section.toLowerCase()}, check your progress: what changed, what still feels difficult, and what would make the next step easier? Write down one action to try next. This turns your work on ${topic} into a practical habit instead of a one-time effort${page > 0 ? " and builds on the previous step" : ""}.`
          ];
        }
      },
      proposal: {
        label: "Project proposal",
        sections: ["Proposal summary", "The opportunity", "Goals and outcomes", "Scope and deliverables", "Approach and timeline", "Resources and ownership", "Risks and safeguards", "Decision and next steps"],
        focus: ["the need and intended value", "the opportunity to address", "measurable outcomes", "deliverables and boundaries", "phases and milestones", "people and resources", "risks and contingencies", "approval and immediate actions"],
        paragraphs(topic, section, page) {
          return [
            `This proposal sets out a possible approach to ${topic}, with ${section.toLowerCase()} as the focus. Describe the need or opportunity, who benefits, and why action is timely. Confirm the problem with stakeholders before treating an early idea as an agreed requirement.`,
            `For ${this.focus[page]}, describe the work in terms a reviewer can evaluate: what will be done, what is out of scope, and what assumptions affect time or resources. Break larger commitments into reviewable deliverables, and show how each contributes to the intended outcome for ${topic}.`,
            `Move ${this.focus[page]} forward with a named owner, a realistic checkpoint, and a simple way to track progress. Note what decision or support is needed from reviewers. Use this proposal to invite feedback and agree on the next step${page > 0 ? " alongside the preceding work" : ""}.`
          ];
        }
      },
      lesson: {
        label: "Learning resource",
        sections: ["Learning goals", "Introducing the topic", "Core concepts", "A worked example", "Guided practice", "Independent activity", "Check your understanding", "What to explore next"],
        focus: ["a clear learning outcome", "prior knowledge and context", "one central idea", "a worked example", "supported practice", "independent application", "evidence of understanding", "a path for further learning"],
        paragraphs(topic, section, page) {
          return [
            `In this part of the lesson on ${topic}, learners explore ${section.toLowerCase()}. By the end, they should be able to explain one key idea in their own words and connect it to a familiar situation. Invite learners to share what they already know.`,
            `Design this part around ${this.focus[page]}. Present ideas in short steps, define unfamiliar terms, and connect each new point to something learners have already encountered. Ask an open question that reveals how learners are reasoning about ${topic}, not only whether they remember a phrase.`,
            `Give learners a chance to apply ${this.focus[page]} through a brief activity: make a prediction, try a task, and explain the result. Check understanding with an open question rather than relying only on recall. Use responses to decide whether to revisit a concept or continue${page > 0 ? " from the last lesson step" : ""}.`
          ];
        }
      },
      story: {
        label: "Story outline",
        sections: ["The opening image", "A world with a problem", "The call to change", "The first turning point", "Pressure and discovery", "The hardest choice", "The final confrontation", "A changed beginning"],
        focus: ["an image that hints at the central idea", "a disruption in the character's ordinary world", "a choice that makes the stakes personal", "a consequence that closes off retreat", "a discovery that changes the plan", "a cost the character must accept", "a decisive test of the character's values", "a new view of the opening image"],
        paragraphs(topic, section, page) {
          return [
            `Build this beat around ${topic}. As ${section.toLowerCase()} unfolds, show the world through a specific image, place, or small action rather than explaining everything at once. Give the central character a want the reader can understand and a reason it matters now.`,
            `Shape ${this.focus[page]} into a scene with a concrete obstacle. Let the character respond in a way that reveals their values, then let that choice create a new consequence. A telling detail, a difficult ally, or a surprising obstacle can make the conflict feel personal.`,
            `End this beat with a change that pushes the story forward: a discovery, a decision, or a cost that cannot be ignored. Carry one unanswered question into the next page. Keep the character's goal visible while allowing their understanding of ${topic} to evolve${page > 0 ? " as the stakes rise" : ""}.`
          ];
        }
      }
    };

    function createDraft(topic, type, pageCount) {
      const profile = draftProfiles[type];
      const title = topic.charAt(0).toLocaleUpperCase() + topic.slice(1);
      const lines = [`# ${title}`, "", `**Format:** ${profile.label}  `, `**Length:** ${pageCount} page${pageCount === 1 ? "" : "s"} (one draft section per requested page)`, "", "> Local structured draft — review and edit before use.", ""];
      for (let page = 0; page < pageCount; page++) {
        const section = profile.sections[page];
        lines.push(`## Page ${page + 1}: ${section}`, "");
        lines.push(`### ${page === 0 ? "Purpose" : "Build on the previous page"}`, profile.paragraphs(topic, section, page)[0], "");
        lines.push("### Key ideas", profile.paragraphs(topic, section, page)[1], "");
        lines.push("### Put it into action", profile.paragraphs(topic, section, page)[2], "");
        if (page < pageCount - 1) lines.push("---", "");
      }
      return { title, content: lines.join("\n").trim() };
    }

    function addWriterMessage(text, kind) {
      const message = document.createElement("div");
      message.className = `writer-message ${kind}`;
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      if (kind !== "user-message") {
        const avatar = document.createElement("span");
        avatar.className = "assistant-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = "b";
        message.append(avatar);
      }
      message.append(paragraph);
      writerConversation.append(message);
    }

    writerForm.addEventListener("submit", event => {
      event.preventDefault();
      const topic = writerTopic.value.trim();
      if (!topic) {
        writerTopic.setCustomValidity("Enter a topic for your document.");
        writerTopic.reportValidity();
        return;
      }
      writerTopic.setCustomValidity("");
      const type = writerType.value;
      const pageCount = Number(writerPages.value);
      const profile = draftProfiles[type];
      if (!profile || !Number.isInteger(pageCount) || pageCount < 1 || pageCount > profile.sections.length) {
        writerResult.hidden = false;
        writerConversation.replaceChildren();
        addWriterMessage("Please choose a document type and a page count from 1 to 8.", "assistant-reply");
        clearWriterChat.disabled = false;
        writerChatStatus.textContent = "";
        return;
      }

      const draft = createDraft(topic, type, pageCount);
      currentDraft = draft.content;
      currentDraftFilename = `${topic.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "briefly-draft"}.md`;
      draftTitle.textContent = `${draft.title} — ${profile.label}`;
      draftPreview.textContent = draft.content;
      writerConversation.replaceChildren();
      addWriterMessage(`Create a ${pageCount}-page ${profile.label.toLowerCase()} about ${topic}.`, "user-message");
      addWriterMessage(`Here’s a structured ${pageCount}-page starting draft about ${topic}. You can preview it below and download it as a Markdown file.`, "assistant-reply");
      writerResult.hidden = false;
      clearWriterChat.disabled = false;
      writerChatStatus.textContent = "";
      writerResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    downloadDraft.addEventListener("click", () => {
      if (!currentDraft) return;
      try {
        const blobUrl = URL.createObjectURL(new Blob([currentDraft], { type: "text/markdown;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = currentDraftFilename;
        document.body.append(link);
        link.click();
        link.remove();
        writerDownloadStatus.textContent = `Download started: ${currentDraftFilename}`;
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (error) {
        writerDownloadStatus.textContent = `Could not create the download: ${error instanceof Error ? error.message : "browser download unavailable"}`;
      }
    });

    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[character]);
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getExtension(name) {
      return name.includes(".") ? name.split(".").pop().toLowerCase() : "";
    }

    function getWords(text) {
      return text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || [];
    }

    function makeSummary(text) {
      const sentences = text
        .replace(/\s+/g, " ")
        .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
        ?.map(sentence => sentence.trim())
        .filter(sentence => getWords(sentence).length >= 5) || [];
      const frequencies = new Map();
      for (const word of getWords(text)) {
        if (word.length > 2 && !stopWords.has(word)) frequencies.set(word, (frequencies.get(word) || 0) + 1);
      }
      const ranked = sentences.map((sentence, index) => {
        const words = getWords(sentence).filter(word => word.length > 2 && !stopWords.has(word));
        const score = words.reduce((sum, word) => sum + (frequencies.get(word) || 0), 0) / Math.max(words.length, 1);
        return { sentence, index, score };
      });
      const chosen = ranked
        .slice()
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, 3)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence);
      const summary = chosen.join(" ") || text.replace(/\s+/g, " ").trim().slice(0, 320);
      const keywords = Array.from(frequencies.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 5)
        .map(([word]) => word);
      return { summary: summary.length > 650 ? `${summary.slice(0, 647).trimEnd()}...` : summary, keywords };
    }

    function makePageSummary(text) {
      const normalizedText = text.replace(/\s+/g, " ").trim();
      const sentences = normalizedText
        .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
        ?.map(sentence => sentence.trim())
        .filter(sentence => getWords(sentence).length >= 4) || [];
      if (!sentences.length) {
        return { summary: normalizedText.slice(0, 360), keywords: [] };
      }

      const wordFrequency = new Map();
      const sentenceFrequency = new Map();
      const sentenceWords = sentences.map(sentence => getWords(sentence)
        .filter(word => word.length > 2 && !stopWords.has(word)));
      for (const words of sentenceWords) {
        for (const word of words) wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        for (const word of new Set(words)) sentenceFrequency.set(word, (sentenceFrequency.get(word) || 0) + 1);
      }

      const ranked = sentences.map((sentence, index) => {
        const words = sentenceWords[index];
        const score = words.reduce((sum, word) => {
          const frequency = wordFrequency.get(word) || 0;
          const spread = sentenceFrequency.get(word) || 1;
          const specificity = Math.log((sentences.length + 1) / spread);
          return sum + Math.log1p(frequency) * (1 + specificity);
        }, 0) / Math.sqrt(Math.max(words.length, 1));
        return { sentence, index, score, words: new Set(words) };
      });

      const wordCount = getWords(normalizedText).length;
      const limit = wordCount > 450 ? 3 : 2;
      const selected = [];
      const candidates = ranked.slice().sort((a, b) => {
        const leadA = a.index < 2 ? 1.12 : 1;
        const leadB = b.index < 2 ? 1.12 : 1;
        return b.score * leadB - a.score * leadA || a.index - b.index;
      });
      for (const candidate of candidates) {
        if (selected.length >= limit) break;
        const overlapsTooMuch = selected.some(item => {
          const overlap = [...candidate.words].filter(word => item.words.has(word)).length;
          return overlap / Math.max(1, Math.min(candidate.words.size, item.words.size)) > 0.65;
        });
        if (!overlapsTooMuch) selected.push(candidate);
      }

      const summary = (selected.length ? selected : ranked.slice(0, 1))
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence)
        .join(" ");
      const keywords = Array.from(wordFrequency.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 4)
        .map(([word]) => word);
      return { summary: summary.length > 650 ? `${summary.slice(0, 647).trimEnd()}...` : summary, keywords };
    }

    async function extractPdf(file) {
      if (!window.pdfjsLib) throw new Error("PDF reader could not load. Check your internet connection and try again.");
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pageTexts = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pageTexts.push(content.items.map(item => ("str" in item ? item.str : "")).join(" "));
      }
      return { text: pageTexts.join("\n"), pageTexts };
    }

    async function extractText(file, extension) {
      if (extension === "pdf") return extractPdf(file);
      if (extension === "docx") {
        if (!window.mammoth) throw new Error("Word reader could not load. Check your internet connection and try again.");
        const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        return { text: result.value, pageTexts: [] };
      }
      if (["txt", "md", "markdown", "csv", "json", "html", "htm", "xml", "log"].includes(extension)) {
        const raw = await file.text();
        if (extension === "html" || extension === "htm" || extension === "xml") {
          const parsed = new DOMParser().parseFromString(raw, "text/html");
          return { text: parsed.body.textContent || "", pageTexts: [] };
        }
        return { text: raw, pageTexts: [] };
      }
      throw new Error(`The .${extension || "unknown"} format is not supported.`);
    }

    function searchScore(document, query) {
      if (!query) return 0;
      const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const content = document.text.toLowerCase();
      const name = document.name.toLowerCase();
      return terms.reduce((score, term) => {
        const inContent = content.split(term).length - 1;
        const inName = name.split(term).length - 1;
        return score + inContent + inName * 4;
      }, 0);
    }

    function highlight(text, query) {
      const terms = query.trim().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
      if (!terms.length) return escapeHtml(text);
      const pattern = new RegExp(`(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
      return text.split(pattern).map(part => terms.some(term => part.toLowerCase() === term.toLowerCase())
        ? `<mark>${escapeHtml(part)}</mark>`
        : escapeHtml(part)).join("");
    }

    function renderPageSummaries(document, query) {
      return document.pageSummaries.map((page, index) => {
        const summary = page.summary
          ? `<div class="page-takeaway-label">PAGE TAKEAWAY</div><p class="page-summary-text">${highlight(page.summary, query)}</p>${page.keywords.length ? `<div class="keywords page-keywords">${page.keywords.map(word => `<span class="keyword">${highlight(word, query)}</span>`).join("")}</div>` : ""}`
          : `<p class="page-summary-text page-summary-empty">No readable text found on this page. It may contain a scanned image.</p>`;
        const listen = page.summary
          ? `<div class="page-listen-row">${listenButton(`page-${document.id}-${index}`, `data-speak-document="${document.id}" data-speak-page="${index}"`)}</div>`
          : "";
        return `<section class="page-summary"><h4 class="page-summary-title">Page ${index + 1}</h4>${summary}${listen}</section>`;
      }).join("");
    }

    function listenButton(key, attributes) {
      const isSpeaking = activeSpeechKey === key;
      const label = isSpeaking ? "Stop" : "Listen";
      const icon = isSpeaking
        ? '<path d="M8 8h8v8H8z" fill="currentColor"/>'
        : '<path d="M4 10v4h3l4 3V7l-4 3H4Zm11-1a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
      return `<button class="listen-button ${isSpeaking ? "speaking" : ""}" type="button" ${attributes} aria-label="${label} summary aloud" aria-pressed="${isSpeaking}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${icon}</svg>${label}</button>`;
    }

    function stopSpeech() {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      activeSpeechKey = "";
    }

    function speakSummary(text, key) {
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        voiceStatus.textContent = "Voice playback is not supported by this browser.";
        return;
      }
      if (activeSpeechKey === key) {
        stopSpeech();
        voiceStatus.textContent = "Voice playback stopped.";
        render();
        return;
      }
      stopSpeech();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = document.documentElement.lang || "en";
      utterance.rate = 1;
      utterance.onstart = () => {
        voiceStatus.textContent = "Reading summary aloud with your browser voice.";
      };
      utterance.onend = () => {
        if (activeSpeechKey === key) {
          activeSpeechKey = "";
          voiceStatus.textContent = "Summary finished.";
          render();
        }
      };
      utterance.onerror = event => {
        if (activeSpeechKey === key && event.error !== "canceled" && event.error !== "interrupted") {
          activeSpeechKey = "";
          voiceStatus.textContent = "Voice playback couldn't start. Check your browser's speech settings.";
          render();
        }
      };
      activeSpeechKey = key;
      voiceStatus.textContent = "Starting voice playback...";
      render();
      window.speechSynthesis.speak(utterance);
    }

    function render() {
      const query = searchInput.value.trim();
      const scored = documents.map(document => ({ document, score: searchScore(document, query) }));
      let visible = query ? scored.filter(item => item.score > 0) : scored;
      if (sortSelect.value === "name") visible.sort((a, b) => a.document.name.localeCompare(b.document.name));
      else if (sortSelect.value === "size") visible.sort((a, b) => b.document.size - a.document.size);
      else visible.sort((a, b) => b.score - a.score || b.document.addedAt - a.document.addedAt);

      document.getElementById("stat-files").textContent = documents.length.toLocaleString();
      document.getElementById("stat-matches").textContent = visible.filter(item => item.document.status === "ready").length.toLocaleString();
      document.getElementById("stat-words").textContent = documents.reduce((sum, item) => sum + item.wordCount, 0).toLocaleString();
      document.getElementById("document-count").textContent = documents.length ? `(${visible.length}${query ? ` of ${documents.length}` : ""})` : "";

      if (!visible.length) {
        fileList.innerHTML = `<div class="empty-state"><strong>${documents.length ? "No matching documents" : "Your workspace is ready"}</strong><p>${documents.length ? "Try another search term or clear your search." : "Add a few documents above to search and summarize them together."}</p></div>`;
        return;
      }

      fileList.innerHTML = visible.map(({ document }) => {
        const statusLabel = document.status === "ready" ? "Ready" : document.status === "error" ? "Couldn't read" : "Reading...";
        const summary = document.status === "ready"
          ? `<div class="summary-label">Quick overview</div><p class="summary-text">${highlight(document.summary, query)}</p>${document.text.trim() ? `<div class="listen-row">${listenButton(`document-${document.id}`, `data-speak-document="${document.id}"`)}</div>` : ""}${document.keywords.length ? `<div class="keywords">${document.keywords.map(word => `<span class="keyword">${highlight(word, query)}</span>`).join("")}</div>` : ""}${document.pageSummaries.length ? `<details class="page-breakdown" data-pages-id="${document.id}" ${expandedPageBreakdowns.has(document.id) ? "open" : ""}><summary>Page-by-page summaries<span class="page-count">${document.pageSummaries.length} pages</span></summary><div class="page-list">${expandedPageBreakdowns.has(document.id) ? renderPageSummaries(document, query) : ""}</div></details>` : ""}`
          : document.status === "error" ? `<p class="error-detail">${escapeHtml(document.error)}</p>` : "";
        return `<article class="file-card">
          <div class="file-top">
            <span class="file-icon" aria-hidden="true">${escapeHtml(document.extension || "FILE")}</span>
            <div class="file-main">
              <div class="file-title-row"><h3 class="file-name" title="${escapeHtml(document.name)}">${highlight(document.name, query)}</h3><span class="status ${document.status === "error" ? "error" : document.status === "processing" ? "processing" : ""}">${statusLabel}</span></div>
              <div class="file-meta">${formatBytes(document.size)}${document.wordCount ? ` | ${document.wordCount.toLocaleString()} words` : ""}${document.pageCount ? ` | ${document.pageCount} pages` : ""}</div>
              ${summary}
            </div>
            <button class="remove-button" type="button" data-remove="${document.id}" aria-label="Remove ${escapeHtml(document.name)}" title="Remove document"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
          </div>
        </article>`;
      }).join("");
    }

    async function addFile(file) {
      const extension = getExtension(file.name);
      const existing = documents.find(document => document.name === file.name && document.size === file.size);
      if (existing) return;
      const document = { id: nextId++, name: file.name, extension, size: file.size, status: "processing", text: "", summary: "", keywords: [], pageSummaries: [], pageCount: 0, wordCount: 0, addedAt: Date.now() };
      documents.unshift(document);
      render();
      try {
        const extracted = await extractText(file, extension);
        document.text = extracted.text;
        document.pageCount = extracted.pageTexts.length;
        document.pageSummaries = extracted.pageTexts.map(pageText => makePageSummary(pageText));
        document.wordCount = getWords(document.text).length;
        const result = makeSummary(document.text);
        document.summary = result.summary || "No readable text was found in this document.";
        document.keywords = result.keywords;
        document.status = "ready";
      } catch (error) {
        document.status = "error";
        document.error = error instanceof Error ? error.message : "An unexpected error occurred while reading this file.";
      }
      render();
    }

    async function addFiles(files) {
      for (const file of files) await addFile(file);
      fileInput.value = "";
    }

    fileInput.addEventListener("change", event => addFiles(Array.from(event.target.files || [])));
    searchInput.addEventListener("input", render);
    sortSelect.addEventListener("change", render);
    fileList.addEventListener("click", event => {
      const voiceButton = event.target.closest("[data-speak-document]");
      if (voiceButton) {
        const document = documents.find(item => item.id === Number(voiceButton.dataset.speakDocument));
        if (!document) return;
        const pageIndex = voiceButton.dataset.speakPage;
        const text = pageIndex === undefined ? document.summary : document.pageSummaries[Number(pageIndex)]?.summary;
        if (!text) return;
        const key = pageIndex === undefined ? `document-${document.id}` : `page-${document.id}-${pageIndex}`;
        speakSummary(text, key);
        return;
      }
      const removeButton = event.target.closest("[data-remove]");
      if (!removeButton) return;
      const index = documents.findIndex(document => document.id === Number(removeButton.dataset.remove));
      if (index !== -1) {
        const document = documents[index];
        if (activeSpeechKey === `document-${document.id}` || activeSpeechKey.startsWith(`page-${document.id}-`)) {
          stopSpeech();
          voiceStatus.textContent = "Voice playback stopped because the document was removed.";
        }
        documents.splice(index, 1);
      }
      render();
    });
    fileList.addEventListener("toggle", event => {
      const details = event.target.closest("details[data-pages-id]");
      if (!details) return;
      const id = Number(details.dataset.pagesId);
      if (!details.open) {
        expandedPageBreakdowns.delete(id);
        return;
      }
      expandedPageBreakdowns.add(id);
      const document = documents.find(item => item.id === id);
      const pageList = details.querySelector(".page-list");
      if (document && pageList && !pageList.hasChildNodes()) {
        pageList.innerHTML = renderPageSummaries(document, searchInput.value.trim());
      }
    }, true);

    for (const eventName of ["dragenter", "dragover"]) {
      dropzone.addEventListener(eventName, event => {
        event.preventDefault();
        dropzone.classList.add("dragging");
      });
    }
    for (const eventName of ["dragleave", "drop"]) {
      dropzone.addEventListener(eventName, event => {
        event.preventDefault();
        if (eventName === "drop" && event.dataTransfer) addFiles(Array.from(event.dataTransfer.files));
        dropzone.classList.remove("dragging");
      });
    }

    document.querySelectorAll("[data-go-workspace]").forEach(button => {
      button.addEventListener("click", () => showPage("workspace"));
    });
    document.querySelectorAll("[data-go-home]").forEach(button => {
      button.addEventListener("click", () => showPage("home"));
    });
    headerAction.addEventListener("click", () => {
      showPage(workspacePage.hidden ? "workspace" : "home");
    });

    window.addEventListener("pageshow", () => window.scrollTo(0, 0), { once: true });
    window.scrollTo(0, 0);
    render();
