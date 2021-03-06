import RDFaUtil, { Context, PrefixDict, RDFaProperties } from '../util/extract-rdfa-util';
import jsdom from "jsdom";
import fs from "fs";
const { JSDOM } = jsdom;

const rdfaUtil = new RDFaUtil();

const generatePlainDOM = () => {
    const htmlSource = fs.readFileSync("./test_examples/test_plain_page.html", "utf-8");
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    return dom;
}

const getRDFaHTMLSource = () => {
    return fs.readFileSync("./test_examples/test_rdfa_page.html", "utf-8");
}

const generateRDFaDOM = () => {
    const htmlSource = getRDFaHTMLSource();
    const dom = new JSDOM(htmlSource, { pretendToBeVisual: true });
    return dom;
}

const globalVocabulary = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl";
const makeContext = () => {
    const context = rdfaUtil.makeEmptyContext();
    context.vocabulary = globalVocabulary;
    return context;
}


test("RDFaProperties interface", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName("div")[0];
    const rdfaAttrs = rdfaUtil.getRDFaAttributes(div);
    const rdfaProps: RDFaProperties = {
        about: rdfaAttrs.about,
        vocab: rdfaAttrs.vocab,
        resource: rdfaAttrs.resource,
        prefix: rdfaAttrs.prefix,
        property: rdfaAttrs.property,
        typeof: rdfaAttrs.typeof
    };
    expect(rdfaProps).not.toBe(null);
});

test("makeEmptyContext returns an empty context", () => {
    const context = rdfaUtil.makeEmptyContext();
    expect(context.vocabulary).toBe(null);
    expect(context.parentResource).toBe(null);
    expect(Object.keys(context.prefixDict).length).toBe(0);
})

test("getRDFaAttributes of element with no attributes returns object with null values", () => {
    const dom = generatePlainDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.about).toBe(null);
});

test("getRDFaAttributes of element with about attribute returns object with about value", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.about).toBe("urn:div=1:repr=original");
});

test("getRDFaAttributes of element with about attribute returns object with resource value", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.resource).toBe("urn:div=1:repr=original");
});

test("getRDFaAttributes of element with property attribute returns object with property value", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    const attributes = rdfaUtil.getRDFaAttributes(p);
    expect(attributes.property).toBe("hasWorkPart");
});

test("getRDFaAttributes of element with single type value returns object with type value string", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    const attributes = rdfaUtil.getRDFaAttributes(p);
    expect(attributes.typeof).toBe("ParagraphInWork");
});

test("getRDFaAttributes of element with no property returns object with empty property value", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[2];
    const attributes = rdfaUtil.getRDFaAttributes(div);
    expect(attributes.property).toBe(null);
});

test("hasRDFaAttributes of element with no RDFa attribute returns false", () => {
    const dom = generateRDFaDOM();
    expect(rdfaUtil.hasRDFaAttributes(dom.window.document.body)).toBe(false);
});

test("hasRDFaAttributes of element with property attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaAttributes(p)).toBe(true);
});

test("hasRDFaResource of element without resource attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaResourceAttribute(p)).toBe(false);
});

test("hasRDFaResource of element with resource attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaResourceAttribute(p)).toBe(true);
});

test("hasRDFaResource of element with about attribute returns true", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[0];
    expect(rdfaUtil.hasRDFaResourceAttribute(div)).toBe(true);
});

test("hasRDFaType of element without typeof attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaTypeAttribute(p)).toBe(false);
});

test("hasRDFaType of element with typeof attribute returns true", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaTypeAttribute(p)).toBe(true);
});

test("hasRDFaPrefix of element without prefix attribute returns false", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    expect(rdfaUtil.hasRDFaPrefixAttribute(p)).toBe(false);
});

test("hasRDFaPrefix of element with prefix attribute returns true", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[1];
    expect(rdfaUtil.hasRDFaPrefixAttribute(div)).toBe(true);
});

test("getRDFaContainer returns null if node has no RDFa container", () => {
    const dom = generateRDFaDOM();
    let rdfaContainer = rdfaUtil.getRDFaContainer(dom.window.document.body);
    expect(rdfaContainer).toBe(null);
})

test("getRDFaContainer returns node if node is an RDFa resource", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[1];
    let rdfaContainer = rdfaUtil.getRDFaContainer(div);
    expect(rdfaContainer).toBe(div);
})

test("getRDFaContainer returns parent if node has RDFa parent", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[2];
    const div = dom.window.document.getElementsByTagName('div')[1];
    let rdfaContainer = rdfaUtil.getRDFaContainer(p);
    expect(rdfaContainer).toBe(div);
})

test("getRDFaResourceAttribute returns a resource Id for an RDFa resource", () => {
    const dom = generateRDFaDOM();
    const div = dom.window.document.getElementsByTagName('div')[1];
    const resourceId = rdfaUtil.getRDFaResourceAttribute(div);
    expect(resourceId).not.toBe(null)
})

test("getRDFaResourceAttribute returns a resource Id for an RDFa resource", () => {
    const dom = generateRDFaDOM();
    const p = dom.window.document.getElementsByTagName('p')[1];
    const resourceId = rdfaUtil.getRDFaResourceAttribute(p);
    expect(resourceId).not.toBe(null)
})

test("getRDFaResourceAttribute throws an error if node has not RDFa resource attribute", () => {
    const dom = generatePlainDOM();
    const p = dom.window.document.getElementsByTagName('p')[0];
    let error = null;
    try {
        rdfaUtil.getRDFaResourceAttribute(p);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null)
})

test("getRDFaRootResource returns a list of resource Ids for RDFa DOM", () => {
    const dom = generateRDFaDOM();
    const topLevelResources = rdfaUtil.getRDFaTopLevelResources(dom.window.document);
    expect(topLevelResources.length).toBe(3)
})

test("isPrefixString returns false if prefixString does not end with colon", () => {
    expect(rdfaUtil.isPrefixString("tt")).toBe(false);
});

test("isPrefixString returns false if prefixString does not end with colon", () => {
    expect(rdfaUtil.isPrefixString("tt: ")).toBe(false);
});

test("isPrefixString returns false if prefixString ends with multiple colons", () => {
    expect(rdfaUtil.isPrefixString("tt::")).toBe(false);
});

test("isPrefixString returns true if prefixString ends with single colon", () => {
    expect(rdfaUtil.isPrefixString("tt:")).toBe(true);
});

test("parsePrefix throws an error if an uneven number of parts is passed", () => {
    const prefixAttribute = "hi: http://example.com/ns# ba:";
    let error = null;
    try {
        rdfaUtil.parsePrefixAttribute(prefixAttribute);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("parsePrefix throws an error if prefix attribute contains an invalid prefix string", () => {
    const prefixAttribute = "hi:: http://example.com/ns#";
    let error = null;
    try {
        rdfaUtil.parsePrefixAttribute(prefixAttribute);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("parsePrefix returns a dict with a single prefix if attribute has one prefix", () => {
    const prefixAttribute = "hi: http://example.com/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict).not.toBe(null);
    expect(Object.keys(prefixDict).length).toBe(1);
});

test("parsePrefix returns a dict with hi prefix if attribute has hi prefix", () => {
    const prefixAttribute = "hi: http://example.com/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict.hasOwnProperty("hi")).toBe(true);
});

test("parsePrefix returns a dict with hi prefix url if attribute has hi prefix", () => {
    const prefixAttribute = "hi: http://example.com/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict.hi).toBe("http://example.com/ns#");
});

test("parsePrefix returns a dict with two prefixes if attribute has two prefixes", () => {
    const prefixAttribute = "hi: http://example.com/ns# ba: http://example.org/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict).not.toBe(null);
    expect(Object.keys(prefixDict).length).toBe(2);
});

test("parsePrefix returns a dict with two prefixes if prefixes are separated by multiple whitespaces", () => {
    const prefixAttribute = "hi: http://example.com/ns#     \nba: http://example.org/ns#";
    const prefixDict = rdfaUtil.parsePrefixAttribute(prefixAttribute);
    expect(prefixDict).not.toBe(null);
    expect(Object.keys(prefixDict).length).toBe(2);
});

test("parsePropertyAttribute returns an IRI of a property literal", () => {
    const propertyAttribute = "hasWorkPart";
    const context = makeContext();
    const propertyIRI = rdfaUtil.parsePropertyAttribute(propertyAttribute, context);
    const expectedIRI = context.vocabulary + "#" + propertyAttribute;
    expect(propertyIRI).toBe(expectedIRI);
});

test("parsePropertyAttribute returns an IRI of a prefixed property", () => {
    const propertyLiteral = "hasWorkPart";
    const prefix = "hi";
    const propertyAttribute = prefix + ":" + propertyLiteral;
    const context = makeContext();
    context.prefixDict[prefix] = globalVocabulary;
    const propertyIRI = rdfaUtil.parsePropertyAttribute(propertyAttribute, context);
    const expectedIRI = context.vocabulary + "#" + propertyLiteral;
    expect(propertyIRI).toBe(expectedIRI);
});


test("setIgnoreElement sets UserSelect to none", () => {
    const dom = generateRDFaDOM();
    const sup = dom.window.document.getElementsByTagName("sup")[0];
    rdfaUtil.setIgnoreElement(sup);
    expect(sup.style.cursor).toBe("not-allowed");
})

test("setIgnoreElementsRecursively sets UserSelect of sup element to none", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const sup = dom.window.document.getElementsByTagName("sup")[0];
    const context = makeContext();
    const ignorableElementClass = context.vocabulary + "#IgnorableElement";
    expect(sup.style.cursor).not.toBe("not-allowed");
    rdfaUtil.setIgnoreElementsRecursively(rdfaRootNode, ignorableElementClass, context);
    expect(sup.style.cursor).toBe("not-allowed");
});

test("setIgnoreElements sets UserSelect of sup element to none", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const sup = dom.window.document.getElementsByTagName("sup")[0];
    const context = makeContext();
    const ignorableElementClass = context.vocabulary + "#IgnorableElement";
    expect(sup.style.cursor).not.toBe("not-allowed");
    rdfaUtil.setIgnoreElements(rdfaRootNode, ignorableElementClass);
    expect(sup.style.cursor).toBe("not-allowed");
});


test("hasRDFaTypePrefix return false if only literal is passed", () => {
    const rdfaTypeString = "Work";
    expect(rdfaUtil.hasRDFaTypePrefix(rdfaTypeString)).toBe(false);
});

test("hasRDFaTypePrefix return false if full IRI is passed", () => {
    const context = makeContext();
    const rdfaTypeString = context.vocabulary + "#Work";
    expect(rdfaUtil.hasRDFaTypePrefix(rdfaTypeString)).toBe(false);
});

test("hasRDFaTypePrefix return true if prefixed literal is passed", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    context.prefixDict["pre"] = context.vocabulary;
    const rdfaTypeString = "pre:Work";
    expect(rdfaUtil.hasRDFaTypePrefix(rdfaTypeString)).toBe(true);
});

test("isLiteral returns false when rdfaTypeString is prefixed", () => {
    const rdfaTypeString = "pre:Work";
    expect(rdfaUtil.isLiteral(rdfaTypeString)).toBe(false);
})

test("isLiteral returns false when rdfaTypeString is IRI", () => {
    const context = makeContext();
    const rdfaTypeString = context.vocabulary + "#Work";
    expect(rdfaUtil.isLiteral(rdfaTypeString)).toBe(false);
})

test("isLiteral returns true when rdfaTypeString is literal", () => {
    const rdfaTypeString = "Work";
    expect(rdfaUtil.isLiteral(rdfaTypeString)).toBe(true);
})

test("makeLiteralTypeIRI adds a # when vocabulary ends in alphanumeric character", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const typeIRI = rdfaUtil.makeLiteralTypeIRI(rdfaTypeString, context.vocabulary);
    expect(typeIRI).toBe(context.vocabulary + "#Work");
})

test("makeLiteralTypeIRI adds nothing when vocabulary ends in #", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    context.vocabulary += "#";
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const typeIRI = rdfaUtil.makeLiteralTypeIRI(rdfaTypeString, context.vocabulary);
    expect(typeIRI).toBe(context.vocabulary + "Work");
})

test("makeLiteralTypeIRI adds nothing when vocabulary ends in /", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    context.vocabulary += "/";
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const typeIRI = rdfaUtil.makeLiteralTypeIRI(rdfaTypeString, context.vocabulary);
    expect(typeIRI).toBe(context.vocabulary + "Work");
})

test("makeTypeIRI throws error when type is literal and no vocabulary is specified", () => {
    const context = makeContext();
    const rdfaTypeString = "Work";
    context.vocabulary = null;
    let error = null;
    try {
        rdfaUtil.makeTypeIRI(rdfaTypeString, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
})

test("makeTypeIRI throws an error if type has prefix and the context has no prefix", () => {
    const context = makeContext();
    context.vocabulary = null;
    const rdfaTypeString = "pre:Work";
    let error = null;
    try {
        rdfaUtil.makeTypeIRI(rdfaTypeString, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
})

test("makeTypeIRI returns rdfaTypeString when rdfaTypeString is IRI", () => {
    const context = makeContext();
    const rdfaTypeString = context.vocabulary + "#Work";
    expect(rdfaUtil.makeTypeIRI(rdfaTypeString, context)).toBe(rdfaTypeString);
})

test("makePrefixedTypeIRI throws an error if literal prefix is not in prefixDict", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    const rdfaTypeString = "pre:Work";
    let error = null;
    try {
        rdfaUtil.makePrefixedTypeIRI(rdfaTypeString, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("makePrefixedTypeIRI returns type IRI if prefixed literal is passed", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    context.prefixDict["pre"] = context.vocabulary;
    const rdfaTypeString = "pre:Work";
    const typeIRI = rdfaUtil.makePrefixedTypeIRI(rdfaTypeString, context);
    expect(typeIRI).toBe(context.vocabulary + "#Work");
});

test("makePrefixedTypeIRI returns type IRI if prefixed literal is passed", () => {
    const context = makeContext();
    if (!context.vocabulary) { return false } // just so typescript won't complain
    context.prefixDict["pre"] = context.vocabulary + "#";
    const rdfaTypeString = "pre:Work";
    const typeIRI = rdfaUtil.makePrefixedTypeIRI(rdfaTypeString, context);
    expect(typeIRI).toBe(context.vocabulary + "#Work");
});

test("copyContext returns a copy of context with same values", () => {
    const context = makeContext();
    const dom = generateRDFaDOM();
    const copiedContext = rdfaUtil.copyContext(dom.window.document.body, context);
    expect(copiedContext.parentResource).toBe(context.parentResource);
    expect(copiedContext.vocabulary).toBe(context.vocabulary);
    expect(copiedContext).not.toBe(context);
});

test("copyContext returns a copy of context with updated values if node sets new vocabulary", () => {
    const context = rdfaUtil.makeEmptyContext();
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const copiedContext = rdfaUtil.copyContext(rdfaRootNode, context);
    expect(copiedContext.vocabulary).not.toBe(context.vocabulary);
});

test("parseTypeAttribute returns a list of type IRIs if typeof attribute has multiple types", () => {
    const dom = generateRDFaDOM();
    const multitypeResrouce = dom.window.document.getElementsByTagName("p")[1];
    const rdfaAttrs = rdfaUtil.getRDFaAttributes(multitypeResrouce);
    if (!rdfaAttrs.typeof) { return false }
    const context = makeContext();
    const typeIRI = rdfaUtil.parseTypeAttribute(rdfaAttrs.typeof, context);
    expect(Array.isArray(typeIRI)).toBe(true);
    expect(typeIRI.length).toBe(2);
});

test("parseRDFaResource throws an error if node has no RDFa resource identifier", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document;
    const context = makeContext();
    let error = null;
    try {
        rdfaUtil.parseRDFaResource(rdfaRootNode, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("parseRDFaResource throws an error if node has no RDFa type", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[2];
    const context = makeContext();
    let error = null;
    try {
        rdfaUtil.parseRDFaResource(rdfaRootNode, context);
    } catch (err) {
        error = err;
    }
    expect(error).not.toBe(null);
});

test("parseRDFaResource returns a resource object if resource has identifier and type", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resource = rdfaUtil.parseRDFaResource(rdfaRootNode, context);
    expect(resource).not.toBe(null);
});

test("parseRDFaResource returns a resource object with no parent if resource has no parent", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resource = rdfaUtil.parseRDFaResource(rdfaRootNode, context);
    expect(resource.parent).toBe(null);
});

test("parseRDFaResource returns a resource object with no parent if resource has no parent", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    context.parentResource = "urn:i:am:the:parent";
    const resource = rdfaUtil.parseRDFaResource(rdfaRootNode, context);
    expect(resource.parent).toBe(context.parentResource);
});

test("parseRDFaResource returns a resource object with IRI of type", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const typeIRI = context.vocabulary + "#" + rdfaUtil.getRDFaAttributes(rdfaRootNode).typeof;
    const resource = rdfaUtil.parseRDFaResource(rdfaRootNode, context);
    expect(resource.type).toBe(typeIRI);
});

test("parseRDFaResource returns a resource object with list of types if resource has multiple types", () => {
    const dom = generateRDFaDOM();
    const multitypeResrouce = dom.window.document.getElementsByTagName("p")[1];
    const context = makeContext();
    const resource = rdfaUtil.parseRDFaResource(multitypeResrouce, context);
    expect(Array.isArray(resource.type)).toBe(true);
    expect(resource.type.length).toBe(2);
});

test("parseRDFaResource returns a resource object with no parent for top resource", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const typeIRI = context.vocabulary + "#" + rdfaUtil.getRDFaAttributes(rdfaRootNode).typeof;
    const resource = rdfaUtil.parseRDFaResource(rdfaRootNode, context);
    expect(resource.parent).toBe(null);
});

test("parseRDFaResource returns a resource object with a parent for sub-resource", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const subresourceNode = dom.window.document.getElementsByTagName("p")[0];
    const context = makeContext();
    const rootNodeAttrs = rdfaUtil.getRDFaAttributes(rdfaRootNode);
    context.parentResource = rootNodeAttrs.resource;
    const resource = rdfaUtil.parseRDFaResource(subresourceNode, context);
    expect(resource.parent).toBe(rootNodeAttrs.resource);
});

test("parseRDFaResources returns an empty list is DOM has no RDFa", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resources = rdfaUtil.parseRDFaResources(rdfaRootNode, context);
    expect(resources.length).toBe(0);
});

test("parseRDFaResources returns a list of resource objects", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const context = makeContext();
    const resources = rdfaUtil.parseRDFaResources(rdfaRootNode, context);
    expect(resources.length).toBe(4);
});

test("parseRDFaResources returns a list of resource objects", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[0];
    const subresourceNode = dom.window.document.getElementsByTagName("p")[0];
    const subresourceAttrs = rdfaUtil.getRDFaAttributes(subresourceNode);
    const context = makeContext();
    const resources = rdfaUtil.parseRDFaResources(rdfaRootNode, context);
    expect(resources[2].id).toBe("urn:div=1:para=1:name=1");
    expect(resources[2].parent).toBe(subresourceAttrs.resource);
});
test("parseRDFaResources returns a list of resource objects", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const para1 = rdfaRootNode.getElementsByTagName("p")[0];
    const para2 = rdfaRootNode.getElementsByTagName("p")[1];
    //const para1Attrs = rdfaUtil.getRDFaAttributes(para1);
    //const para2Attrs = rdfaUtil.getRDFaAttributes(para2);
    const context = makeContext();
    context.vocabulary = null;
    const resources = rdfaUtil.parseRDFaResources(rdfaRootNode, context);
    expect(resources[1].type).not.toBe(resources[2].type);
});

test("registerRDFaResources always returns a registry when there are no RDFa resources", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.body;
    const registry = rdfaUtil.registerRDFaResources(rdfaRootNode);
    expect(registry).not.toBe(null);
})

test("registerRDFaResources returns an empty registry when there are no RDFa resources", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.body;
    const registry = rdfaUtil.registerRDFaResources(rdfaRootNode);
    expect(Object.keys(registry.index).length).toBe(0);
})

test("registerRDFaResources returns an empty registry when passing a non-ELEMENT node", () => {
    const dom = generatePlainDOM();
    const rdfaRootNode = dom.window.document.body.childNodes[0];
    const registry = rdfaUtil.registerRDFaResources(rdfaRootNode);
    expect(Object.keys(registry.index).length).toBe(0);
})

test("registerRDFaResources returns an non-empty registry when passing a RDFa node", () => {
    const dom = generateRDFaDOM();
    const rdfaRootNode = dom.window.document.getElementsByTagName("div")[1];
    const registry = rdfaUtil.registerRDFaResources(rdfaRootNode);
    expect(Object.keys(registry.index).length).not.toBe(0);
})

/*
*/