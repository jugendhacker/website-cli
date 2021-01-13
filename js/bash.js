import * as Tree from './util/tree.js';

const views = {
    input: document.getElementById("input"),
    output: document.getElementById("output-wrapper"),
    dir: document.getElementById("working-dir"),
    prefix: document.getElementById("prefix")
};

views.input.addEventListener('keydown', e => {
    if (e.key === 'Enter'){
        console.log("Enter pressed!");
        enterPressed();
    }
});

document.addEventListener('click', () => {
    views.input.focus();
});

const enterPressed = () => {
    output(views.prefix.innerText + views.input.value);
    runCommand(views.input.value);
    views.input.value = "";
    window.scroll(0, document.body.scrollHeight);
};

const runCommand = (input) => {
    let command = input.split(" ");
    switch (command[0]) {
        case "ls":
            runLs(command, workingDir);
            break;
        case "cd":
            runCd(command, workingDir);
            break;
        case "cat":
            runCat(command, workingDir);
            break;
        case "exit":
            runExit(command, workingDir);
            break;
        case "clear":
            runClear(command, workingDir);
            break;
        case "echo":
            runEcho(command, workingDir);
            break;
        case "cowsay":
            runCowsay(command, workingDir);
            break;
        case "":
            break;
        default:
            output("bash: " + command[0] + ": command not found");
            break;
    }
};

const runLs = (command, dir) => {
    let path = dir.name;
    if (command[1]){
        path = command[1];
        dir = changeDir(dir, path);
    }
    if (dir === Tree.FSErrors.NOT_THERE){
        output("ls: cannot access '" + command[1] + "': No such file or directory")
        return;
    }
    console.log(dir.children);
    if (dir.children.length !== 0) {
        let ls = "";
        dir.children.sort((a, b) => (a.name > b.name)? 1 : ((a.name < b.name) ? -1 : 0)).forEach(value => {
            ls = ls + value.name + " ";
        });
        output(ls);
    }
};

const runCd = (command, dir) => {
    let changed = changeDir(dir, command[1]);
    if (changed === Tree.FSErrors.NO_DIR){
        output("bash: cd: " + command[1] + ": Not a directory")
    } else {
        workingDir = changed;
        displayDir(workingDir);
    }
};

const runCat = (command, dir) => {
    let path = "";
    if (command[1].charAt(command[1].length - 1) === '/'){
        path = command[1].substring(0, command[1].length - 1);
    } else {
        path = command[1]
    }
    if (path.split("/").length > 1){
        let pathArray = path.split("/");
        path = pathArray.pop();
        console.log(pathArray, path);
        dir = changeDir(dir, pathArray.join("/"));
    }
    let found = false;
    dir.children.forEach((value => {
        if (value.name === path){
            if (value.type === Tree.ElementTypes.FILE){
                output(value.value);
                found = true;
            }else {
                output("cat: " + command[1] + ": Is a directory");
                found = true;
            }

        }
    }));
    if (!found){
        output("cat: " + command[1] + ": No such file or directory");
    }
};

const runCowsay = (command, dir) => {
    command.shift()
    let words = command.join()
    let cow = "<pre> "+("_".repeat(words.length+2))+"\n"
    cow += "< "+words+" >\n"
    cow += " "+("-".repeat(words.length+2))+"\n"
    cow += "       \\    ^__^ \n"
    cow += "        \\   (oo)\_______ \n"
    cow += "            (__)\       )\\/\\ \n"
    cow += "                ||----w | \n"
    cow += "                ||     || </pre>"
    output(cow)
}

    

const runExit = (command, dir) => {
    output("Bye");
    let inputField = document.getElementById("input-wrapper");
    inputField.parentElement.removeChild(inputField);
};

const runClear = (command, dir) => {
    views.output.innerHTML = "";
};

const runEcho = (command, dir) => {
    console.log(command);
    output(command.splice(1).join(" "));
};

const changeDir = (currdir, targetdir) => {
    if (targetdir.charAt(0) === '/'){
        while (currdir.parent !== null){
            currdir = currdir.parent;
        }
        currdir = changeDir(currdir, targetdir.substring(1));
    }else if (targetdir.substring(0, 2) === ".." || targetdir === ".."){
        currdir = changeDir(currdir.parent, targetdir.substring(3))
    }else {
        if (targetdir.split("/")[0] !== ""){
            let found = false;
            currdir.children.forEach((value => {
                if (value.name === targetdir.split("/")[0]) {
                    currdir = changeDir(value, targetdir.split("/").splice(1).join("/"));
                    found = true;
                }
            }));
            if (!found){
                currdir = Tree.FSErrors.NOT_THERE;
            }
        }
    }
    if (currdir === Tree.FSErrors.NOT_THERE){
        return Tree.FSErrors.NOT_THERE;
    } else if (currdir.type === Tree.ElementTypes.DIRECTORY){
        return currdir;
    } else {
        return Tree.FSErrors.NO_DIR;
    }
};

const output = (text) => {
    const div = document.createElement("div");
    /*let lines = text.split("\n");
    while (lines.length > 0) {
        div.appendChild(document.createTextNode(lines[0]));
        if (lines.length > 1){
            div.appendChild(document.createElement("br"));
        }
        lines = lines.splice(1);
    }*/
    div.innerHTML = text;

    views.output.append(div);
};

const displayDir = (workingDir) => {
    let path = buildPath(workingDir);

    views.dir.innerText = path;

};

const buildPath = (fselement) => {
    let path = fselement.name;
    if(fselement.type === Tree.ElementTypes.DIRECTORY){
        path = path + "/";
        if (fselement.parent !== null){
            path = buildPath(fselement.parent) + path;
        }
    }
    console.log(path);
    return path;
};

// Building FS
let workingDir = new Tree.FSElement("", Tree.ElementTypes.DIRECTORY);

// About
let aboutDir = new Tree.FSElement("about", Tree.ElementTypes.DIRECTORY);
let aboutFile = new Tree.FSElement("about.txt", Tree.ElementTypes.FILE, "" +
    "Hallo,<br>" +
    "ich bin Julian und das hier ist ein kleines Experiment von mir 😉");
aboutFile.parent = aboutDir;
aboutDir.children.push(aboutFile);
aboutDir.parent = workingDir;
workingDir.children.push(aboutDir);

//Social Media
let socialMediaDir = new Tree.FSElement("social", Tree.ElementTypes.DIRECTORY);
//Twitter
let twitterFile = new Tree.FSElement("twitter.txt", Tree.ElementTypes.FILE, "" +
    "Auf Twitter findet ihr mich als <a href='https://twitter.com/jugendhacker'>@jugendhacker</a><br>" +
    "Jedoch bin ich da kaum aktiv da ich zentralisierung immer etwas abgeneigt bin");
twitterFile.parent = socialMediaDir;
socialMediaDir.children.push(twitterFile);
//Mastodon
let mastodonFile = new Tree.FSElement("mastodon.txt", Tree.ElementTypes.FILE, "" +
    "In letzter Zeit bin ich auf Mastodon sehr aktiv. Unter dem Account <a href='https://social.anoxinon.de/@jr' target='_blank'>@jr@social.anoxinon.de</a> findest du mich dort!<br>" +
    "Gerne freue ich mich auch über den ein oder anderen Like und Follow 😉");
mastodonFile.parent = socialMediaDir;
socialMediaDir.children.push(mastodonFile);
socialMediaDir.parent = workingDir;
workingDir.children.push(socialMediaDir);

//IM
let imDir = new Tree.FSElement("messaging", Tree.ElementTypes.DIRECTORY);
//File
let imFile = new Tree.FSElement("messaging.txt", Tree.ElementTypes.FILE, "" +
    "Falls du mir eine Nachricht schreiben willst kannst du es an folgenden Stellen probieren:<br>" +
    "XMPP: <a href='xmpp:j.r@jugendhacker.de'>j.r@jugendhacker.de</a><br>" +
    "Telegram: <a href='https://t.me/jugendhacker'>@jugendhacker</a><br>" +
    "Mail (auch wenn's kein Messenger ist!): <a href='mailto:j.r@jugendhacker.de'>j.r@jugendhacker.de</a>");
imFile.parent = imDir;
imDir.children.push(imFile);
imDir.parent = workingDir;
workingDir.children.push(imDir);

displayDir(workingDir);
