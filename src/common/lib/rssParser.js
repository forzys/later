
import { DOMParser } from '@xmldom/xmldom'

const utils = {
    getElements : (node, tagName) => {
        if (!node || !node.getElementsByTagName(tagName)) {
          return [];
        }
      
        const elements = node.getElementsByTagName(tagName);
      
        return Array.prototype.slice.call(elements);
      },
      
      getChildElements : (node, tagName, namespace) => {
        if (!node) {
          return [];
        }
      
        const elements = namespace
          ? node.getElementsByTagNameNS(namespace, tagName)
          : node.getElementsByTagName(tagName);
      
        if (!elements) {
          return [];
        }
      
        return Array.prototype.filter.call(elements, (element) => element.parentNode.nodeName === node.nodeName);
    },
      
    getElementTextContentArray: (node, tagName, namespace) => {
        const nodes = utils.getChildElements(node, tagName, namespace); 
        if (!nodes || nodes.length === 0) {
          return [];
        }
        return nodes.map((node) => node.textContent);
    },
      
      getElementTextContent: (node, tagName, namespace) => {
        const array = utils.getElementTextContentArray(node, tagName, namespace);
        return array.length === 0 ? undefined : array[0];
      },
}

const namespaces = {
    itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd',
    content: 'http://purl.org/rss/1.0/modules/content/',
};

const itunesParser = (()=>{
    const getAuthors = (node) => {
        const authors = utils.getElementTextContentArray(
          node,
          'author',
          namespaces.itunes
        );
      
        return authors.map((author) => ({
          name: author,
        }));
      };
      
      const getBlock = (node) =>
        utils.getElementTextContent(node, 'block', namespaces.itunes);
      
    const getSubCategories = (node) => {
        const categories = utils.getChildElements(
          node,
          'category',
          namespaces.itunes
        );
      
        if (categories.length === 0) {
          return [];
        }
      
        return categories.map((category) => ({
          name: category.getAttribute('text'),
        }));
      };
      
      const getCategories = (node) => {
        const categories = utils.getChildElements(
          node,
          'category',
          namespaces.itunes
        );
      
        return categories.map((category) => ({
          name: category.getAttribute('text'),
          subCategories: getSubCategories(category),
        }));
      };
      
    const getComplete = (node) =>
    utils.getElementTextContent(node, 'complete', namespaces.itunes);
  
  const getDuration = (node) =>
    utils.getElementTextContent(node, 'duration', namespaces.itunes);
  
  const getExplicit = (node) =>
    utils.getElementTextContent(node, 'explicit', namespaces.itunes);
  
  const getImage = (node) => {
    const images = utils.getChildElements(node, 'image', namespaces.itunes);
  
    return images.length > 0 ? images[0].getAttribute('href') : undefined;
  };
  
  const getIsClosedCaptioned = (node) =>
    utils.getElementTextContent(node, 'isClosedCaptioned', namespaces.itunes);
  
  const getNewFeedUrl = (node) =>
    utils.getElementTextContent(node, 'new-feed-url', namespaces.itunes);
  
  const getOrder = (node) =>
    utils.getElementTextContent(node, 'order', namespaces.itunes);
  
  const getOwner = (node) => {
    const owners = utils.getChildElements(node, 'owner', namespaces.itunes);
  
    if (owners.length === 0) {
      return {
        name: undefined,
        email: undefined,
      };
    }
  
    return {
      name: utils.getElementTextContent(owners[0], 'name', namespaces.itunes),
      email: utils.getElementTextContent(owners[0], 'email', namespaces.itunes),
    };
  };

    const getSubtitle = (node) => utils.getElementTextContent(node, 'subtitle', namespaces.itunes);

    const getSummary = (node) => utils.getElementTextContent(node, 'summary', namespaces.itunes);
     
    return {
        parseChannel: (node) => ({
            authors: getAuthors(node),
            block: getBlock(node),
            categories: getCategories(node),
            complete: getComplete(node),
            explicit: getExplicit(node),
            image: getImage(node),
            newFeedUrl: getNewFeedUrl(node),
            owner: getOwner(node),
            subtitle: getSubtitle(node),
            summary: getSummary(node),
        }), 
        parseItem : (node) => ({
            authors: getAuthors(node),
            block: getBlock(node),
            duration: getDuration(node),
            explicit: getExplicit(node),
            image: getImage(node),
            isClosedCaptioned: getIsClosedCaptioned(node),
            order: getOrder(node),
            subtitle: getSubtitle(node),
            summary: getSummary(node),
        }),
    }
})();

const model = {
    rss: {
        type: undefined,
        title: undefined,
        links: [
        {
            url: undefined,
            rel: undefined,
        },
        ],
        description: undefined,
        language: undefined,
        copyright: undefined,
        authors: [
        {
            name: undefined,
        },
        ],
        lastUpdated: undefined,
        lastPublished: undefined,
        categories: [
        {
            name: undefined,
        },
        ],
        image: {
        url: undefined,
        title: undefined,
        description: undefined,
        width: undefined,
        height: undefined,
        },
        itunes: {
        author: [
            {
            name: undefined,
            },
        ],
        block: undefined,
        categories: [
            {
            name: undefined,
            subCategories: [
                {
                name: undefined,
                },
            ],
            },
        ],
        image: undefined,
        explicit: undefined,
        complete: undefined,
        newFeedUrl: undefined,
        owner: {
            name: undefined,
            email: undefined,
        },
        subtitle: undefined,
        summary: undefined,
        },
        items: [
        {
            title: undefined,
            links: [
            {
                url: undefined,
                rel: undefined,
            },
            ],
            id: undefined,
            imageUrl: undefined,
            description: undefined,
            content: undefined,
            categories: [
            {
                name: undefined,
            },
            ],
            authors: [
            {
                name: undefined,
            },
            ],
            published: undefined,
            enclosures: [
            {
                url: undefined,
                length: undefined,
                mimeType: undefined,
            },
            ],
            itunes: {
            authors: [
                {
                name: undefined,
                },
            ],
            block: undefined,
            duration: undefined,
            explicit: undefined,
            image: undefined,
            isClosedCaptioned: undefined,
            order: undefined,
            subtitle: undefined,
            summary: undefined,
            },
        },
        ],
    },
};

const atomV1Parser = (()=>{ 
    const getChannelTitle = (node) => utils.getElementTextContent(node, 'title');

    const getChannelLinks = (node) => {
        const links = utils.getChildElements(node, 'link'); 
        return links.map((link) => ({
            url: link.getAttribute('href'),
            rel: link.getAttribute('rel'),
        }));
    };

    const getChannelDescription = (node) => utils.getElementTextContent(node, 'subtitle');

    const getChannelCopyright = (node) => utils.getElementTextContent(node, 'rights');
    
    const getChannelAuthors = (node) => {
        const authors = utils.getChildElements(node, 'author');
        return authors.map((author) => ({ name: utils.getElementTextContent(author, 'name') }));
    };
            

    const getChannelLastUpdated = (node) => utils.getElementTextContent(node, 'updated');

    const getChannelLastPublished = (node) => utils.getElementTextContent(node, 'published');

    const getChannelCategories = (node) => {
        const categories = utils.getChildElements(node, 'category');
        return categories.map((category) => ({  name: category.getAttribute('term') }));
    };

    const getChannelImage = (node) => {
        let img = utils.getElementTextContent(node, 'image'); 
        if (img === '' || img === undefined) {
            img = utils.getElementTextContent(node, 'logo');
        } 
        if (img === '' || img === undefined) {
            img = utils.getElementTextContent(node, 'icon');
        }

        return {
            url: img,
            title: undefined,
            description: undefined,
            width: undefined,
            height: undefined,
        };
    };

    const getItemTitle = (node) => utils.getElementTextContent(node, 'title');

    const getItemLinks = (node) => {
        const links = utils.getChildElements(node, 'link');
        const linksWithoutEnclosures = links.filter((link) => link.getAttribute('rel') !== 'enclosure');
        return linksWithoutEnclosures.map((link) => ({
            url: link.getAttribute('href'),
            rel: link.getAttribute('rel'),
        }));
    };

    const getItemDescription = (node) =>  utils.getElementTextContent(node, 'summary');
    const getItemContent = (node) => utils.getElementTextContent(node, 'content');
    const getItemImage = (node) => utils.getElementTextContent(node, 'icon');

    const getItemAuthors = (node) => {
        const authors = utils.getChildElements(node, 'author');
        return authors.map((author) => ({  name: utils.getElementTextContent(author, 'name') }));
    };

    const getItemCategories = (node) => {
        const categories = utils.getChildElements(node, 'category'); 
        return categories.map((category) => ({ name: category.getAttribute('term') }));
    };

    const getItemPublished = (node) => {
        let pub = utils.getElementTextContent(node, 'updated');
        
        if (pub === '' || pub === undefined) {
            pub = utils.getElementTextContent(node, 'published');
        } 
        return pub;
    };
        
    const getItemId = (node) => utils.getElementTextContent(node, 'id');
        
    const getItemEnclosures = (node) => {
        const links = utils.getChildElements(node, 'link');
        const enclosureLinks = links.filter((link) => link.getAttribute('rel') === 'enclosure');
        
        return enclosureLinks.map((link) => ({
            url: link.getAttribute('href'),
            length: link.getAttribute('length'),
            mimeType: link.getAttribute('type'),
        }));
    };

    const mapChannelFields = (document) => {
        const channelNodes = utils.getElements(document, 'feed');
        
        if (!channelNodes || channelNodes.length === 0) {
            throw new Error('Could not find channel node');
        }
        
        const channelNode = channelNodes[0];
        
        return {
            title: getChannelTitle(channelNode),
            links: getChannelLinks(channelNode),
            description: getChannelDescription(channelNode),
            copyright: getChannelCopyright(channelNode),
            authors: getChannelAuthors(channelNode),
            lastUpdated: getChannelLastUpdated(channelNode),
            lastPublished: getChannelLastPublished(channelNode),
            categories: getChannelCategories(channelNode),
            image: getChannelImage(channelNode),
            itunes: itunesParser.parseChannel(channelNode),
        };
    };
        
    const mapItems = (document) => {
        const itemNodes = utils.getElements(document, 'entry');
        
        return itemNodes.map((item) => ({
            title: getItemTitle(item),
            links: getItemLinks(item),
            description: getItemDescription(item),
            id: getItemId(item),
            imageUrl: getItemImage(item),
            content: getItemContent(item),
            authors: getItemAuthors(item),
            categories: getItemCategories(item),
            published: getItemPublished(item),
            enclosures: getItemEnclosures(item),
            itunes: itunesParser.parseItem(item),
        }));
    };

    return {
        parse: (document) => ({
            ...model.rss,
            type: 'atom-v1',
            ...mapChannelFields(document),
            items: mapItems(document),
        }),
    }
})();

const rssV2Parser = (()=>{ 
    const getChannelTitle = (node) => utils.getElementTextContent(node, 'title');

    const getChannelLinks = (node) => {
        const links = utils.getChildElements(node, 'link');
        return links.map((link) => ({  url: link.textContent,  rel: link.getAttribute('rel') }));
    };

    const getChannelDescription = (node) => utils.getElementTextContent(node, 'description');

    const getChannelLanguage = (node) => utils.getElementTextContent(node, 'language');

    const getChannelCopyright = (node) => utils.getElementTextContent(node, 'copyright');
    
    const getChannelAuthors = (node) => {
        const authors = utils.getElementTextContentArray(node, 'managingEditor'); 
        return authors.map((author) => ({ name: author }));
    };

    const getChannelLastUpdated = (node) =>  utils.getElementTextContent(node, 'lastBuildDate');
    
    const getChannelLastPublished = (node) => utils.getElementTextContent(node, 'pubDate');
    
    const getChannelCategories = (node) => {
        const categories = utils.getElementTextContentArray(node, 'category');
        return categories.map((category) => ({  name: category }));
    };

    const getChannelImage = (node) => {
        const imageNodes = utils.getChildElements(node, 'image');
    
        if (imageNodes.length === 0) {
            return {
                url: undefined,
                title: undefined,
                description: undefined,
                width: undefined,
                height: undefined,
            };
        }
    
        const imageNode = imageNodes[0];
    
        return {
            url: utils.getElementTextContent(imageNode, 'url'),
            title: utils.getElementTextContent(imageNode, 'title'),
            description: utils.getElementTextContent(imageNode, 'description'),
            width: utils.getElementTextContent(imageNode, 'width'),
            height: utils.getElementTextContent(imageNode, 'height'),
        };
    };
    
    const getItemTitle = (node) => utils.getElementTextContent(node, 'title');
    
    const getItemLinks = (node) => {
        const links = utils.getChildElements(node, 'link');
    
        return links.map((link) => ({
            url: link.textContent,
            rel: link.getAttribute('rel'),
        }));
    };

    const getItemDescription = (node) => utils.getElementTextContent(node, 'description');

    const getItemContent = (node) =>  utils.getElementTextContent(node, 'encoded', namespaces.content);
    
    const getItemAuthors = (node) => {
        let authors = utils.getElementTextContentArray(node, 'author');
    
        if (authors.length === 0) {
            authors = utils.getElementTextContentArray(node, 'dc:creator');
        } 
        return authors.map((author) => ({ name: author }));
    };

    const getItemCategories = (node) => {
        let categories = utils.getElementTextContentArray(node, 'category');
    
        if (categories.length === 0) {
            categories = utils.getElementTextContentArray(node, 'dc:subject');
        }
    
        return categories.map((category) => ({ name: category }));
    };

    const getItemId = (node) => utils.getElementTextContent(node, 'guid');
    
    const getItemPublished = (node) =>
        utils.getElementTextContent(node, 'pubDate') ||
        utils.getElementTextContent(node, 'dc:date');
    
    const getItemEnclosures = (node) => {
        const enclosures = utils.getChildElements(node, 'enclosure');
    
        return enclosures.map((enclosure) => ({
            url: enclosure.getAttribute('url'),
            length: enclosure.getAttribute('length'),
            mimeType: enclosure.getAttribute('type'),
        }));
    };

    const mapChannelFields = (document) => {
        const channelNodes = utils.getElements(document, 'channel');
    
        if (!channelNodes || channelNodes.length === 0) {
            throw new Error('Could not find channel node');
        }
    
        const channelNode = channelNodes[0];
    
        return {
            title: getChannelTitle(channelNode),
            links: getChannelLinks(channelNode),
            description: getChannelDescription(channelNode),
            language: getChannelLanguage(channelNode),
            copyright: getChannelCopyright(channelNode),
            authors: getChannelAuthors(channelNode),
            lastUpdated: getChannelLastUpdated(channelNode),
            lastPublished: getChannelLastPublished(channelNode),
            categories: getChannelCategories(channelNode),
            image: getChannelImage(channelNode),
            itunes: itunesParser.parseChannel(channelNode),
        };
    };

    const mapItems = (document) => {
        const itemNodes = utils.getElements(document, 'item');
    
        return itemNodes.map((item) => ({
            title: getItemTitle(item),
            links: getItemLinks(item),
            description: getItemDescription(item),
            content: getItemContent(item),
            id: getItemId(item),
            authors: getItemAuthors(item),
            categories: getItemCategories(item),
            published: getItemPublished(item),
            enclosures: getItemEnclosures(item),
            itunes: itunesParser.parseItem(item),
        }));
    };
    return {
        parse: (document) => ({
            ...model.rss,
            type: 'rss-v2',
            ...mapChannelFields(document),
            items: mapItems(document),
        }) 
    }
})();
 
const getParser = (document) => {
    const isRssSpecification = document.getElementsByTagName('channel')[0] !== undefined;
    const isAtomSpecification =  document.getElementsByTagName('feed')[0] !== undefined;

    if (isRssSpecification) {
        return rssV2Parser;
    } 
    if (isAtomSpecification) {
        return atomV1Parser;
    } 
    return null;
};

export default {
    parse:(feed) => new Promise((resolve, reject) => {
      const document = new DOMParser().parseFromString(feed, 'text/xml'); 
      const parser = getParser(document); 
      if (!parser) {
        reject('Unable to find any RSS element in feed');
      }
      const parsedFeed = parser.parse(document); 
      resolve(parsedFeed);
  })
}