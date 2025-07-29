/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { sleep } from "@utils/misc";
import definePlugin, { makeRange, OptionType } from "@utils/types";
import { Message, ReactionEmoji } from "@vencord/discord-types";
import {
    RelationshipStore,
    SelectedChannelStore,
    UserStore,
} from "@webpack/common";

interface IMessageCreate {
    type: "MESSAGE_CREATE";
    optimistic: boolean;
    isPushNotification: boolean;
    channelId: string;
    message: Message;
}

interface IReactionAdd {
    type: "MESSAGE_REACTION_ADD";
    optimistic: boolean;
    channelId: string;
    messageId: string;
    messageAuthorId: string;
    userId: "195136840355807232";
    emoji: ReactionEmoji;
}

interface IVoiceChannelEffectSendEvent {
    type: string;
    emoji?: ReactionEmoji; // Just in case...
    channelId: string;
    userId: string;
    animationType: number;
    animationId: number;
}

const settings = definePluginSettings({
    volume: {
        description: "Volume of the 🗿🗿🗿",
        type: OptionType.SLIDER,
        markers: makeRange(0, 1, 0.1),
        default: 0.5,
        stickToMarkers: false,
    },
    quality: {
        description: "Quality of the 🗿🗿🗿",
        type: OptionType.SELECT,
        options: [
            { label: "Normal", value: "Normal", default: true },
            { label: "HD", value: "HD" },
        ],
    },
    triggerWhenUnfocused: {
        description: "Trigger the 🗿 even when the window is unfocused",
        type: OptionType.BOOLEAN,
        default: true,
    },
    ignoreBots: {
        description: "Ignore bots",
        type: OptionType.BOOLEAN,
        default: true,
    },
    ignoreBlocked: {
        description: "Ignore blocked users",
        type: OptionType.BOOLEAN,
        default: true,
    },
    emojiSoundLimit: {
        description: "Limits the number of sounds played per message",
        type: OptionType.SLIDER,
        markers: makeRange(0, 50, 5),
        default: 10,
        stickToMarkers: true,

    },
    bonkEnabled: {
        description: "Enable the Bonk sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
    chadgeEnabled: {
        description: "Enable the Chadge sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
    gaygeEnabled: {
        description: "Enable the Gayge sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
    huhcatEnabled: {
        description: "Enable the Huhcat sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
    moyaiEnabled: {
        description: "Enable the 🗿 sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
    pipeEnabled: {
        description: "Enable the Pipe sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
    susEnabled: {
        description: "Enable the Sus sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
    whatEnabled: {
        description: "Enable the What (Prowler) sound",
        type: OptionType.BOOLEAN,
        default: true,
    },
});



const MOYAI_URL =
    "https://raw.githubusercontent.com/MeguminSama/VencordPlugins/main/plugins/moyai/moyai.mp3";
const MOYAI_URL_HD =
    "https://raw.githubusercontent.com/MeguminSama/VencordPlugins/main/plugins/moyai/moyai_hd.wav";

// Custom sounds for the discord
const HUHCAT_SOUND_URL =
    "https://github.com/mrbeggs/vencord-plugin-resources/raw/refs/heads/main/soundboard/huhcat.mp3";

const WHAT_SOUND_URL =
    "https://github.com/mrbeggs/vencord-plugin-resources/raw/refs/heads/main/soundboard/prowler.mp3";

const CHADGE_SOUND_URL =
    "https://github.com/mrbeggs/vencord-plugin-resources/raw/refs/heads/main/soundboard/rizz.mp3";

const GAY_SOUND_URL =
    "https://github.com/mrbeggs/vencord-plugin-resources/raw/refs/heads/main/soundboard/gay.mp3";

const PIPE_SOUND_URL =
    "https://github.com/mrbeggs/vencord-plugin-resources/raw/refs/heads/main/soundboard/metalpipe.mp3";

const BONK_SOUND_URL =
    "https://github.com/mrbeggs/vencord-plugin-resources/raw/refs/heads/main/soundboard/bonk.mp3";

const SUS_SOUND_URL =
    "https://github.com/mrbeggs/vencord-plugin-resources/raw/refs/heads/main/soundboard/sus.mp3";

const customMoyaiRe = /<a?:\w*mo?yai\w*:\d*>|🗿/gi;
const customHuhcatRe = /<a?:\w*huhcat\w*:\d*>|\w*huh\w*/gi;
const customWhatRe = /<a?:\w*what\w*:\d*>/gi;
const customChadgeRe = /<a?:\w*chadge\w*:\d*>/gi;
const customGaygeRe = /<a?:\w*gayge\w*:\d*>/gi;
const customFallRe = /<a?:\w*fall\w*:\d*>/gi;
const customBonkRe = /<a?:\w*bonk\w*:\d*>/gi;
const customSusRe = /<a?:\w*sus\w*:\d*>/gi;

const MOYAI = "🗿";
const HUHCAT_NAME = "huhcat";
const CHADGE_NAME = "chadge";
const GAYGE_NAME = "gayge";
const PIPE_NAME = "pipe";
const WHAT_NAME = "what";
const BONK_NAME = "bonk";
const SUS_NAME = "sus";

const EMOJI_STORE = [
    {
        names: [MOYAI],
        regex: customMoyaiRe,
    },
    {
        names: [HUHCAT_NAME, "huh"],
        regex: customHuhcatRe,
    },
    {
        names: [WHAT_NAME],
        regex: customWhatRe,
    },
    {
        names: [CHADGE_NAME],
        regex: customChadgeRe,
    },
    {
        names: [GAYGE_NAME],
        regex: customGaygeRe,
    },
    {
        names: [PIPE_NAME],
        regex: customFallRe,
    },
    {
        names: [BONK_NAME],
        regex: customBonkRe,
    },
    {
        names: [SUS_NAME],
        regex: customSusRe,
    }
];

export default definePlugin({
    name: "Moyai",
    authors: [Devs.Megu, Devs.Nuckyz],
    description: "🗿🗿🗿🗿🗿🗿🗿🗿",
    settings,

    flux: {
        async MESSAGE_CREATE({
            optimistic,
            type,
            message,
            channelId,
        }: IMessageCreate) {
            if (optimistic || type !== "MESSAGE_CREATE") return;
            if (message.state === "SENDING") return;
            if (settings.store.ignoreBots && message.author?.bot) return;
            if (
                settings.store.ignoreBlocked &&
                RelationshipStore.isBlocked(message.author?.id)
            )
                return;
            if (!message.content) return;
            if (channelId !== SelectedChannelStore.getChannelId()) return;

            for (const emoji of EMOJI_STORE) {
                const { names } = emoji;
                const { regex } = emoji;

                // console.log(
                //     `Checking for ${names} in message: ${message.content}`
                // );

                const emojiCount = getEmojiCount(message.content, regex);

                if (emojiCount === 0) continue;

                console.log(
                    `Playing sound for ${message.content} ${names[0]} ${emojiCount} times`
                );
                for (let i = 0; i < emojiCount; i++) {
                    playCustomSound(names[0]);
                    await sleep(300);
                }
            }
        },

        MESSAGE_REACTION_ADD({
            optimistic,
            type,
            channelId,
            userId,
            messageAuthorId,
            emoji,
        }: IReactionAdd) {
            if (optimistic || type !== "MESSAGE_REACTION_ADD") return;
            if (settings.store.ignoreBots && UserStore.getUser(userId)?.bot)
                return;
            if (
                settings.store.ignoreBlocked &&
                RelationshipStore.isBlocked(messageAuthorId)
            )
                return;
            if (channelId !== SelectedChannelStore.getChannelId()) return;

            const name = emoji.name.toLowerCase();

            playCustomSound(name);
        },

        VOICE_CHANNEL_EFFECT_SEND({ emoji }: IVoiceChannelEffectSendEvent) {
            if (!emoji?.name) return;
            const name = emoji.name.toLowerCase();

            playCustomSound(name);
        },
    },
});

function countOccurrences(sourceString: string, subString: string) {
    let i = 0;
    let lastIdx = 0;
    while ((lastIdx = sourceString.indexOf(subString, lastIdx) + 1) !== 0) i++;

    return i;
}

function countMatches(sourceString: string, pattern: RegExp) {
    if (!pattern.global) throw new Error("pattern must be global");

    let i = 0;
    while (pattern.test(sourceString)) i++;

    return i;
}

function getEmojiCount(message: string, regex: RegExp) {
    const count =
        // countOccurrences(message, name) +
        countMatches(message, regex);

    return Math.min(count, settings.store.emojiSoundLimit);
}

function playCustomSound(name: string) {
    console.log("Playing sound for:", name);
    let soundUrl: string | undefined;

    if (isMoyai(name) && settings.store.moyaiEnabled) {
        soundUrl = settings.store.quality === "HD" ? MOYAI_URL_HD : MOYAI_URL;
    }

    if (isHuhcat(name) && settings.store.huhcatEnabled) {
        soundUrl = HUHCAT_SOUND_URL;
    }

    if (isWhat(name) && settings.store.whatEnabled) {
        soundUrl = WHAT_SOUND_URL;
    }

    if (isChadge(name) && settings.store.chadgeEnabled) {
        soundUrl = CHADGE_SOUND_URL;
    }

    if (isGay(name) && settings.store.gaygeEnabled) {
        soundUrl = GAY_SOUND_URL;
    }

    if (isPipe(name) && settings.store.pipeEnabled) {
        soundUrl = PIPE_SOUND_URL;
    }

    if (isSus(name) && settings.store.susEnabled) {
        soundUrl = SUS_SOUND_URL;
    }

    if (isBonk(name) && settings.store.bonkEnabled) {
        soundUrl = BONK_SOUND_URL;
    }

    playSoundFromUrl(soundUrl || "");
}

function playSoundFromUrl(url: string) {
    console.log("Playing sound from URL:", url);
    if (!url) return;

    if (!settings.store.triggerWhenUnfocused && !document.hasFocus()) return;
    const audioElement = document.createElement("audio");
    audioElement.src = url;
    audioElement.volume = settings.store.volume;
    audioElement.play();
}

function isBonk(name: string) {
    return getEmojiCount(name, customBonkRe) > 0 || name === BONK_NAME;
}

function isChadge(name: string) {
    return getEmojiCount(name, customChadgeRe) > 0 || name === CHADGE_NAME;
}

function isGay(name: string) {
    return getEmojiCount(name, customGaygeRe) > 0 || name === GAYGE_NAME;
}

function isMoyai(name: string) {
    return getEmojiCount(name, customMoyaiRe) > 0 || name === MOYAI;
}

function isHuhcat(name: string) {
    return getEmojiCount(name, customHuhcatRe) > 0 || name === HUHCAT_NAME;
}

function isPipe(name: string) {
    return getEmojiCount(name, customFallRe) > 0 || name === PIPE_NAME;
}

function isSus(name: string) {
    return getEmojiCount(name, customSusRe) > 0 || name === SUS_NAME;
}

function isWhat(name: string) {
    return getEmojiCount(name, customWhatRe) > 0 || name === WHAT_NAME;
}
