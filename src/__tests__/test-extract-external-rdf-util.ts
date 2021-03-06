import ExternalRDFUtil, { InternalExternalMap } from '../util/extract-external-rdf-util';
import RDFaUtil from "../util/extract-rdfa-util";
import Resource, { ResourceRegistry } from "../model/Resource";
import { defaultConfig, HierarchicalRelation } from "../model/ClientConfig";
const $rdf = require("rdflib");
const fetch = require("jest-fetch-mock");
import jsdom from "jsdom";
import fs from "fs";
const { JSDOM } = jsdom;

const externalUtil = new ExternalRDFUtil();
const rdfaUtil = new RDFaUtil();

const getExternalTurtle = () => {
    return fs.readFileSync("./test_examples/test_rdfa_page.ttl", "utf-8");
}

const getPlainHTMLSource = () => {
    return fs.readFileSync("./test_examples/test_plain_page.html", "utf-8");
}

const generatePlainDOM = () => {
    const htmlSource = getPlainHTMLSource();
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

test("isAlternateLink returns false when node is not of type LINK", () => {
    const element = document.createElement("div");
    expect(externalUtil.isAlternateLink(element)).toBe(false);
});

test("isAlternateLink returns false when node is of type LINK but has no href attribute", () => {
    const element = document.createElement("link");
    expect(externalUtil.isAlternateLink(element)).toBe(false);
});

test("isAlternateLink returns false when node is of type LINK but has no rel attribute", () => {
    const element = document.createElement("link");
    element.setAttribute("href", "http://boot.huygens.knaw.nl/vgdemo/test_rdfa_page.ttl")
    expect(externalUtil.isAlternateLink(element)).toBe(false);
});

test("isAlternateLink returns false when node is of type LINK but rel attribute value is not alternate", () => {
    const element = document.createElement("link");
    element.setAttribute("href", "http://boot.huygens.knaw.nl/vgdemo/test_rdfa_page.ttl")
    element.setAttribute("rel", "stylesheet");
    expect(externalUtil.isAlternateLink(element)).toBe(false);
});

test("isAlternateLink returns true when LINK node has href and rel attribute value is alternate", () => {
    const element = document.createElement("link");
    element.setAttribute("href", "http://boot.huygens.knaw.nl/vgdemo/test_rdfa_page.ttl")
    element.setAttribute("rel", "alternate");
    expect(externalUtil.isAlternateLink(element)).toBe(true);
});

test("getAlternateLinks returns an empty list if no alternate links are defined", () => {
    const dom = generatePlainDOM();
    const alternateLinks = externalUtil.getAlternateLinks(dom.window.document);
    expect(Array.isArray(alternateLinks)).toBe(true);
    expect(alternateLinks.length).toBe(0);
});

test("getAlternateLinks returns a list with one link if one alternate link is defined", () => {
    const dom = generateRDFaDOM();
    const alternateLinks = externalUtil.getAlternateLinks(dom.window.document);
    expect(alternateLinks.length).toBe(1);
});

test("getAlternateLinkRefs returns an empty list if no link refs are defined", () => {
    const dom = generatePlainDOM();
    const alternateLinkRefs = externalUtil.getAlternateLinkRefs(dom.window.document);
    expect(Array.isArray(alternateLinkRefs)).toBe(true);
    expect(alternateLinkRefs.length).toBe(0);
});

test("getAlternateLinkRefs returns an list with one ref if one link ref is defined", () => {
    const dom = generateRDFaDOM();
    const alternateLinkRefs = externalUtil.getAlternateLinkRefs(dom.window.document);
    expect(alternateLinkRefs.length).toBe(1);
});

test("mapInternalExternalResource returns object with internal and external properties", () => {
    const internal = "internal-id"
    const external = "external-id"
    const map = externalUtil.mapInternalExternalResource(internal, external);
    expect(map.internal).toBe(internal);
    expect(map.external).toBe(external);
});

test("resourceIncludes returns false when hierarchicalRelations is empty", () => {
    const relation = defaultConfig.hierarchicalRelations[1].includes;
    const relations: Array<HierarchicalRelation> = [];
    const check = externalUtil.resourceIncludes(relation, relations);
    expect(check).toBe(false);
});

test("resourceIncludes returns true when in hierarchicalRelations", () => {
    const relation = defaultConfig.hierarchicalRelations[1].includes;
    const check = externalUtil.resourceIncludes(relation, defaultConfig.hierarchicalRelations);
    expect(check).toBe(true);
});

test("resourceIsIncludedIn returns false when hierarchicalRelations is empty", () => {
    const relation = defaultConfig.hierarchicalRelations[1].isIncludedIn;
    if (!relation) { return false };
    const relations: Array<HierarchicalRelation> = [];
    const check = externalUtil.resourceIsIncludedIn(relation, relations);
    expect(check).toBe(false);
});

test("resourceIsIncludedIn returns true when in hierarchicalRelations", () => {
    const relation = defaultConfig.hierarchicalRelations[1].isIncludedIn;
    if (!relation) { return false };
    const check = externalUtil.resourceIsIncludedIn(relation, defaultConfig.hierarchicalRelations);
    expect(check).toBe(true);
});

test("getInverseIncludes returns null when relation is not in hierarchicalRelations", () => {
    const relation = "non-existent-relation";
    const inverse = externalUtil.getInverseIncludes(relation, defaultConfig.hierarchicalRelations);
    expect(inverse).toBe(null);
});

test("getInverseIncludes returns inverse when includes has inverse", () => {
    const relationPair = defaultConfig.hierarchicalRelations[1];
    const relation = relationPair.includes;
    const inverse = externalUtil.getInverseIncludes(relation, defaultConfig.hierarchicalRelations);
    expect(inverse).toBe(relationPair.isIncludedIn);
});

test("getInverseIncludes returns null when includes has no inverse", () => {
    const relationPair = defaultConfig.hierarchicalRelations[0];
    const relation = relationPair.includes;
    const inverse = externalUtil.getInverseIncludes(relation, defaultConfig.hierarchicalRelations);
    expect(inverse).toBe(null);
});

test("getInverseIncludes returns inverse when isIncludedIn has inverse", () => {
    const relationPair = defaultConfig.hierarchicalRelations[1];
    const relation = relationPair.isIncludedIn;
    if (!relation) { return false };
    const inverse = externalUtil.getInverseIncludes(relation, defaultConfig.hierarchicalRelations);
    expect(inverse).toBe(relationPair.includes);
});

describe("mapInternalExternalResources", () => {

    it("should return a list with mappings of internal to external resources", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const rdfaRootNode = dom.window.document.body.getElementsByTagName("div")[0];
        const registeredResources = rdfaUtil.registerRDFaResources(rdfaRootNode);
        fetch.mockResponseOnce(externalData);
        const relations = defaultConfig.representationRelations;
        if (!relations) { return false };
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            const intExtMap = await externalUtil.mapInternalExternalResources(externalStore, registeredResources, relations);
            expect(intExtMap.length).not.toBe(0);
            done();
        });
    });

})

describe("readExternalResources", () => {

    beforeEach(() => {
        fetch.resetMocks();
    });

    it("should fetch external resource data", (done) => {
        const externalURL = "http://boot.huygens.knaw.nl/vgdemo/test_rdfa_page.ttl";
        const vocabularyURL = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#";
        const externalData = getExternalTurtle();
        fetch.mockResponseOnce(externalData);
        externalUtil.readExternalResources(externalURL).then(data => {
            expect(data.includes(vocabularyURL)).toBe(true);
            done();
        });
    });
});

describe("loading external resources", () => {

    beforeEach(() => {
        fetch.resetMocks();
    });

    it("loadExternalResource should fetch external resource data", (done) => {
        const predicate = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
        const object = "urn:div=1:para=1:repr=original";
        const subject = "urn:div=1:para=1";
        const externalData = getExternalTurtle();
        const dom = generateRDFaDOM();
        const alternateLinkRefs = externalUtil.getAlternateLinkRefs(dom.window.document);
        const externalStore = $rdf.graph();
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResource(alternateLinkRefs[0], externalStore).then(result => {
            const predicateNode = $rdf.sym(predicate);
            const objectNode = $rdf.sym(object);
            const subjectNode = externalStore.any(undefined, predicateNode, objectNode);
            expect(subjectNode.value).toBe(subject);
            done();
        });
    });

    it("loadExternalResources should fetch external resource data", (done) => {
        const predicate = "http://boot.huygens.knaw.nl/vgdemo/editionannotationontology.ttl#hasRepresentation";
        const object = "urn:div=1:para=1:repr=original";
        const subject = "urn:div=1:para=1";
        const externalData = getExternalTurtle();
        const dom = generateRDFaDOM();
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(externalStore => {
            const predicateNode = $rdf.sym(predicate);
            const objectNode = $rdf.sym(object);
            const subjectNode = externalStore.any(undefined, predicateNode, objectNode);
            expect(subjectNode.value).toBe(subject);
            done();
        });
    });
});

describe("parseExternalResourceHierarchy", () => {

    it("should return an empty list if an empty InternalExternalMap is passed", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const rdfaRootNode = dom.window.document.body.getElementsByTagName("div")[0];
        const registeredResources = rdfaUtil.registerRDFaResources(rdfaRootNode);
        const relations = defaultConfig.representationRelations;
        if (!relations) { return false }
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            const externalResourceMap: Array<InternalExternalMap> = [];
            const externalResourceList = externalUtil.parseExternalResourcesHierarchy(externalStore, externalResourceMap, defaultConfig);
            expect(externalResourceList.length).toBe(0);
            done();
        });
    });

    it("should return a non-empty list if a non-empty InternalExternalMap is passed", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const rdfaRootNode = dom.window.document.body.getElementsByTagName("div")[0];
        const registeredResources = rdfaUtil.registerRDFaResources(rdfaRootNode);
        const relations = defaultConfig.representationRelations;
        if (!relations) { return false }
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            const externalResourceMap = externalUtil.mapInternalExternalResources(externalStore, registeredResources, relations);
            const externalResourceList = externalUtil.parseExternalResourcesHierarchy(externalStore, externalResourceMap, defaultConfig);
            expect(externalResourceList.length).not.toBe(0);
            done();
        });
    });

    it("should return resources that have a type", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const rdfaRootNode = dom.window.document.body.getElementsByTagName("div")[0];
        const registeredResources = rdfaUtil.registerRDFaResources(rdfaRootNode);
        const relations = defaultConfig.representationRelations;
        if (!relations) { return false }
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            const externalResourceMap = externalUtil.mapInternalExternalResources(externalStore, registeredResources, relations);
            const externalResourceList = externalUtil.parseExternalResourcesHierarchy(externalStore, externalResourceMap, defaultConfig);
            expect(externalResourceList[0].type.length).not.toBe(0);
            done();
        });
    });
});


describe("parseExternalResourceData", () => {

    it("should return a resource with correct id if resourceId is passed", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const resourceId = "urn:div=1:para=1";
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            if (!defaultConfig.hierarchicalRelations) { return false }
            const resource = externalUtil.parseExternalResourceData(resourceId, externalStore, defaultConfig.hierarchicalRelations);
            expect(resource.id).toBe(resourceId);
            done();
        });
    });

    it("should return a resource with parent id if resourceId is passed", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const resourceId = "urn:div=1:para=1";
        const parentId = "urn:div=1";
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            if (!defaultConfig.hierarchicalRelations) { return false }
            const resource = externalUtil.parseExternalResourceData(resourceId, externalStore, defaultConfig.hierarchicalRelations);
            expect(resource.parent).toBe(parentId);
            done();
        });
    });

    it("should return a resource with parent id if isIncluded relation is used", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const resourceId = "urn:div=1:para=2";
        const parentId = "urn:div=1";
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            if (!defaultConfig.hierarchicalRelations) { return false }
            const resource = externalUtil.parseExternalResourceData(resourceId, externalStore, defaultConfig.hierarchicalRelations);
            expect(resource.parent).toBe(parentId);
            done();
        });
    });
});


describe("listExternalResources", () => {

    it("should throw an error when no valid RDF store is passed", (done) => {
        const resourceRegistry: ResourceRegistry = new ResourceRegistry([], {});
        let error = null;
        externalUtil.listExternalResources(null, resourceRegistry, defaultConfig).catch(err => {
            error = err;
            expect(error).not.toBe(null);
            done();
        });
    });

    it("should return a list", (done) => {
        const externalStore = $rdf.graph();
        const resourceRegistry: ResourceRegistry = new ResourceRegistry([], {});
        externalUtil.listExternalResources(externalStore, resourceRegistry, defaultConfig).then(externalResourceList => {
            expect(externalResourceList).not.toBe(null);
            expect(Array.isArray(externalResourceList)).toBe(true);
            done();
        });
    });

    it("should return an empty list if there are no external representations", (done) => {
        const externalStore = $rdf.graph();
        const resourceRegistry: ResourceRegistry = new ResourceRegistry([], {});
        externalUtil.listExternalResources(externalStore, resourceRegistry, defaultConfig).then(externalResourceList => {
            expect(externalResourceList.length).toBe(0);
            done();
        });
    });

    it("should return a non-empty list if there are external representations", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const rdfaRootNode = dom.window.document.body.getElementsByTagName("div")[0];
        const registeredResources = rdfaUtil.registerRDFaResources(rdfaRootNode);
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            const externalResourceList = await externalUtil.listExternalResources(externalStore, registeredResources, defaultConfig);
            expect(externalResourceList.length).not.toBe(0);
            done();
        });
    });

    it("should return a list with items that have parent resources specified", (done) => {
        const dom = generateRDFaDOM();
        const externalData = getExternalTurtle();
        const rdfaRootNode = dom.window.document.body.getElementsByTagName("div")[0];
        const registeredResources = rdfaUtil.registerRDFaResources(rdfaRootNode);
        fetch.mockResponseOnce(externalData);
        externalUtil.loadExternalResources(dom.window.document).then(async externalStore => {
            const externalResourceList = await externalUtil.listExternalResources(externalStore, registeredResources, defaultConfig);
            expect(externalResourceList[1].parent).not.toBe(null);
            done();
        });
    });
    /*
    */
});

