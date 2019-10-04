const ElementTypes = {
    FILE: "file",
    DIRECTORY: "dir"
};

const FSErrors = {
    NO_DIR: 0,
    NOT_THERE: 1
};

function FSElement(name, type, value = null) {
    this.name = name;
    this.type = type;
    this.parent = null;
    this.children = [];
    this.value = value;
};

export {FSElement, ElementTypes, FSErrors};