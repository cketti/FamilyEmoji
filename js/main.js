// Super ugly. Don't go there!

var translation = {
    "woman": 0,
    "man": -30,
    "girl": 0,
    "boy": -25
};

var parentShift = 30;
var childShift = 25;

var family = {};

var emojis = {
    "woman": "👩",
    "man": "👨",
    "girl": "👧",
    "boy": "👦"
};

var ZWJ = "\u200d";

var colors = [
    {
        "hair": "#ffb300",
        "skin": "#ffdd67",
        "mouth-and-eyes": "#937237",
        "skin-tone-modifier": ""
    },
    {
        "hair": "#594640",
        "skin": "#ffe1bd",
        "mouth-and-eyes": "#664e27",
        "skin-tone-modifier": "🏻"
    },
    {
        "hair": "#dbb471",
        "skin": "#fed0ac",
        "mouth-and-eyes": "#664e27",
        "skin-tone-modifier": "🏼"
    },
    {
        "hair": "#594640",
        "skin": "#d6a57c",
        "mouth-and-eyes": "#664e27",
        "skin-tone-modifier": "🏽"
    },
    {
        "hair": "#231f20",
        "skin": "#b47d56",
        "mouth-and-eyes": "#664e27",
        "skin-tone-modifier": "🏾"
    },
    {
        "hair": "#231f20",
        "skin": "#8a6859",
        "mouth-and-eyes": "#574137",
        "skin-tone-modifier": "🏿"
    }
];


function drawFamily() {
    $("#parents-container").empty();
    $("#children-container").empty();

    for (var i = 0; i < family.parents.length; i++) {
        drawParent(family.parents[i], i);
    }

    for (var i = 0; i < family.children.length; i++) {
        drawChild(family.children[i], i);
    }

    var parentsWidth = parentShift * family.parents.length;
    var childrenWidth = childShift * family.children.length;

    if (parentsWidth > childrenWidth) {
        var translateX = (parentsWidth - childrenWidth) / 2 - 5;
        $("#parents-container").attr("transform", "");
        $("#children-container").attr("transform", "translate(" + translateX + ")");
        $("#family").get(0).setAttribute("viewBox", "0 0 " + (parentsWidth + 4) + " 64");
    } else {
        var translateX = (childrenWidth - parentsWidth) / 2;
        $("#parents-container").attr("transform", "translate(" + translateX + ")");
        $("#children-container").attr("transform", "translate(-5)");
        $("#family").get(0).setAttribute("viewBox", "0 0 " + (childrenWidth + 4) + " 64");
    }

    setEmoji();
}

function setEmoji() {
    var emoji = "";

    var title = "Family: ";

    var type = family.parents[0].type;
    emoji += emojis[type];
    var skin_tone = family.parents[0].skin_tone;
    var modifier = colors[skin_tone]["skin-tone-modifier"];
    emoji += modifier;
    title += type;

    for (var i = 1; i < family.parents.length; i++) {
        emoji += ZWJ;

        type = family.parents[i].type;
        emoji += emojis[type];
        skin_tone = family.parents[i].skin_tone;
        modifier = colors[skin_tone]["skin-tone-modifier"];
        emoji += modifier;

        title += ", " + type;
    }

    emoji += ZWJ;

    type = family.children[0].type;
    emoji += emojis[type];
    skin_tone = family.children[0].skin_tone;
    modifier = colors[skin_tone]["skin-tone-modifier"];
    emoji += modifier;

    title += ", " + type;

    for (var i = 1; i < family.children.length; i++) {
        emoji += ZWJ;

        type = family.children[i].type;
        emoji += emojis[type];
        skin_tone = family.children[i].skin_tone;
        modifier = colors[skin_tone]["skin-tone-modifier"];
        emoji += modifier;

        title += ", " + type;
    }

    $("#emoji").val(emoji);

    var codepointString = toCodePoints(emoji).map(function (codepoint) {
        return "U+" + Number(codepoint).toString(16).toUpperCase()
    }).join(", ");
    $("#codepoints").text(codepointString);

    window.location.hash = emoji;
    // $("head>title").text(title);
}

function drawParent(person, position) {
    var translateX = translation[person.type] + position * parentShift;

    var svg = $("#" + person.type).get(0).cloneNode(true);
    svg.id = "parent-" + position;
    var jsvg = $(svg);
    jsvg.attr("transform", "translate(" + translateX + ")");

    setSkinTone(jsvg, person["skin_tone"]);

    $("#parents-container").append(svg);

    jsvg.click(function () {
        selected.type = "parent";
        selected.index = position;

        $("#change-type-parents").show();
        $("#change-type-children").hide();

        if (family.parents.length === 1) {
            $(".remove-person").hide();
        } else {
            $(".remove-person").show();
        }

        $("#modal-change-person").modal('open');
    });
}

function drawChild(person, position) {
    var translateX = translation[person.type] + position * childShift;

    var svg = $("#" + person.type).get(0).cloneNode(true);
    svg.id = "child-" + position;
    var jsvg = $(svg);
    jsvg.attr("transform", "translate(" + translateX + ")");

    setSkinTone(jsvg, person["skin_tone"]);

    $("#children-container").append(svg);

    jsvg.click(function () {
        selected.type = "child";
        selected.index = position;

        $("#change-type-parents").hide();
        $("#change-type-children").show();

        if (family.children.length === 1) {
            $(".remove-person").hide();
        } else {
            $(".remove-person").show();
        }

        $("#modal-change-person").modal('open');
    });
}

function setSkinTone(element, skinTone) {
    element.find(".hair").attr("fill", colors[skinTone].hair);
    element.find(".skin").attr("fill", colors[skinTone].skin);
    element.find(".mouth-and-eyes").attr("fill", colors[skinTone]["mouth-and-eyes"]);
}

function selectPerson(element) {
    selected = element.value;
}

function toCodePoints(input) {
    var chars = [];
    for (var i = 0; i < input.length; i++) {
        var c1 = input.charCodeAt(i);
        if (c1 >= 0xD800 && c1 < 0xDC00 && i + 1 < input.length) {
            var c2 = input.charCodeAt(i + 1);
            if (c2 >= 0xDC00 && c2 < 0xE000) {
                chars.push(0x10000 + ((c1 - 0xD800) << 10) + (c2 - 0xDC00));
                i++;
                continue;
            }
        }
        chars.push(c1);
    }
    return chars;
}

function addPerson(type) {
    if (type == 'woman' || type == 'man') {
        family.parents.push({
            "type": type,
            "skin_tone": last_selected_skin_tone
        });
    } else {
        family.children.push({
            "type": type,
            "skin_tone": last_selected_skin_tone
        });
    }

    drawFamily();
}


var selected = {
    'type': 'parent',
    'index': 0
};

function changePersonType(type) {
    if (selected.type === 'parent') {
        family.parents[selected.index].type = type;
    } else {
        family.children[selected.index].type = type;
    }

    drawFamily();

    $('#modal-change-person').modal('close');
}

var last_selected_skin_tone = 0;

function changeSkinTone(skin_tone) {
    last_selected_skin_tone = skin_tone;
    if (selected.type === 'parent') {
        family.parents[selected.index].skin_tone = skin_tone;
    } else {
        family.children[selected.index].skin_tone = skin_tone
    }

    var modified = false;
    if (skin_tone === 0) {
        for (var i = 0; i < family.parents.length; i++) {
            if (selected.index !== i && family.parents[i].skin_tone !== 0) {
                modified = true;
                family.parents[i].skin_tone = 0;
            }
        }
        for (var i = 0; i < family.children.length; i++) {
            if (selected.index !== i && family.children[i].skin_tone !== 0) {
                modified = true;
                family.children[i].skin_tone = 0;
            }
        }

        if (modified) {
            Materialize.toast('Removing skin tones from all family members', 3000);
        }
    } else {
        for (var i = 0; i < family.parents.length; i++) {
            var person = family.parents[i];
            if (person.skin_tone === 0) {
                modified = true;
                person.skin_tone = skin_tone;
            }
        }
        for (var i = 0; i < family.children.length; i++) {
            var person = family.children[i];
            if (person.skin_tone === 0) {
                modified = true;
                person.skin_tone = skin_tone;
            }
        }

        if (modified) {
            Materialize.toast('Enabling skin tones for all family members', 3000);
        }
    }

    drawFamily();

    $('#modal-change-person').modal('close');
}

function parseEmojiSequence(sequence) {
    if (!sequence || sequence.length == 0) {
        throw "No input";
    }

    var tempFamily = {
        'parents': [],
        'children': []
    };

    var emoji_with_skin_tone = false;
    var emoji_without_skin_tone = false;

    while (sequence.length > 0) {
        var emoji = parseEmoji(sequence);
        if (emoji === null) {
            throw "Supported emoji expected";
        }

        sequence = sequence.substring(2);

        if (sequence.length === 0) {
            emoji_without_skin_tone = true;
            if (emoji === 'woman' || emoji === 'man') {
                tempFamily.parents.push({
                    'type': emoji,
                    'skin_tone': 0
                });
            } else {
                tempFamily.children.push({
                    'type': emoji,
                    'skin_tone': 0
                });
            }
            if (last_selected_skin_tone !== 0) {
                last_selected_skin_tone = 0;
            }

            if (tempFamily.parents.length < 1 || tempFamily.children.length < 1) {
                throw "Not a family";
            }
            if (emoji_with_skin_tone && emoji_without_skin_tone) {
                last_selected_skin_tone = 0;
                return removeSkinTones(tempFamily);
            } else {
                return tempFamily;
            }
        }

        var skin_tone = parseSkinTone(sequence);
        if (skin_tone) {
            emoji_with_skin_tone = true;
            sequence = sequence.substring(2);
            if (emoji === 'woman' || emoji === 'man') {
                tempFamily.parents.push({
                    'type': emoji,
                    'skin_tone': skin_tone
                });
            } else {
                tempFamily.children.push({
                    'type': emoji,
                    'skin_tone': skin_tone
                });
            }
            if (last_selected_skin_tone === 0) {
                last_selected_skin_tone = skin_tone;
            }
        } else {
            emoji_without_skin_tone = true;
            if (emoji === 'woman' || emoji === 'man') {
                tempFamily.parents.push({
                    'type': emoji,
                    'skin_tone': 0
                });
            } else {
                tempFamily.children.push({
                    'type': emoji,
                    'skin_tone': 0
                });
            }
            if (last_selected_skin_tone !== 0) {
                last_selected_skin_tone = 0;
            }
        }

        if (sequence.length === 0) {
            if (tempFamily.parents.length < 1 || tempFamily.children.length < 1) {
                throw "Not a family";
            }
            if (emoji_with_skin_tone && emoji_without_skin_tone) {
                return removeSkinTones(tempFamily);
            } else {
                return tempFamily;
            }
        }

        if (!sequence.startsWith(ZWJ)) {
            throw "Expected zero width joiner";
        }

        sequence = sequence.substring(1);
    }

    throw "Sequence ended with ZWJ"
}

function removeSkinTones(family) {
    for (var i = 0; i < family.parents.length; i++) {
        family.parents[i].skin_tone = 0;
    }
    for (var i = 0; i < family.children.length; i++) {
        family.children[i].skin_tone = 0;
    }

    return family;
}

function parseEmoji(sequence) {
    for (var person_type in emojis) {
        if (sequence.startsWith(emojis[person_type])) {
            return person_type;
        }
    }

    return null;
}

function parseSkinTone(sequence) {
    for (var i = 1; i < colors.length; i++) {
        if (sequence.startsWith(colors[i]['skin-tone-modifier'])) {
            return i;
        }
    }
}

function setEmojiFromFragment() {
    var hash = decodeURIComponent(window.location.hash);
    var codepointString = toCodePoints(hash).map(function (codepoint) {
        return "U+" + Number(codepoint).toString(16).toUpperCase()
    }).join(", ");
    console.log(codepointString);

    try {
        family = parseEmojiSequence(hash && hash.length > 0 ? hash.substring(1) : "");
    } catch (err) {
        console.log(err);
        family = parseEmojiSequence("👨‍👩‍👧‍👦");
    }

    drawFamily();
}

function removePerson() {
    if (selected.type === 'parent') {
        if (family.parents.length > 1) {
            family.parents.splice(selected.index, 1);
        }
    } else {
        if (family.children.length > 1) {
            family.children.splice(selected.index, 1);
        }
    }

    drawFamily();
}

function copyFamily() {
    $('#emoji').get(0).select();
    document.execCommand('copy');

    Materialize.toast('Copied to clipboard', 1000);
}

$(document).ready(function () {
    $('.modal').modal();

    setEmojiFromFragment();

    $(window).on('popstate', function() {
        setEmojiFromFragment();
    }).keydown(function(event) {
        console.log("key: " + event.which);
        if (event.which === 'R'.charCodeAt(0)) {
            family = parseEmojiSequence("👨‍👩‍👧‍👦");
            drawFamily();
        }
    });

});
