import scrapy
import logging
import urllib
import shutil
import os
import time
import json
logging.getLogger('scrapy').setLevel(logging.WARNING)


class daliccCrawler(scrapy.Spider):
    name = 'daliccCrawler'

    def __init__(self, category=None, *args, **kwargs):
        super(daliccCrawler, self).__init__(*args, **kwargs)
        self.start_urls = ['https://dalicc.net/license-library?page=0']
        self.counter = 0
        self.licenseURLs = []
        self.scriptDir = os.path.dirname(os.path.abspath(__file__))
        with open(self.scriptDir + '/config.json') as configFile:
            self.config = json.load(configFile)
        self.licenseDir = self.config['path']
        if not (self.licenseDir[0] == '/') and not (self.licenseDir[1] == ':'):
            # path is not absolute
            self.licenseDir = self.scriptDir + '/' + self.licenseDir
        os.makedirs(self.licenseDir, exist_ok=True)

    def parse(self, response):
        # even after new page layout, still gather links first, now check for license list elements that arent pagers and strip for hrefs
        tmpURLs = response.xpath('//div[has-class("license-list")]').xpath('.//li[not(has-class("pager__item"))]').css('a::attr(href)').getall()
        if len(tmpURLs) > 0 and tmpURLs[0] not in self.licenseURLs:
            self.licenseURLs += tmpURLs
            self.counter += 1
            yield response.follow('https://www.dalicc.net/license-library?page=' + str(self.counter), callback=self.parse)
        else:
            for url in self.licenseURLs:
                yield response.follow('https://www.dalicc.net' + url, callback=self.parse)
        if '?page=' not in response.url and len(response.xpath("//li[contains(text(),'Dataset')]").getall()) > 0:
            # files cant be downloaded anymore and need to be extracted now, onlz checks dataset licenses
            lines = []
            lines.append('<' + response.url + '> a <http://www.w3.org/ns/odrl/2/Set> .\n')
            self.fillTextFields(lines, response.xpath("//div[has-class('license-box license-info')]").xpath(".//li[not(.//li)]"), response.url)
            self.fillPermissions(lines, response.xpath("//div[has-class('license-box license-permissions')]").xpath(".//div[has-class('license-data license-permissions-data')]"), response.url)
            self.fillProhibitions(lines, response.xpath("//div[has-class('license-box license-prohibitions')]"), response.url)
            fileName = response.url[39:]
            filePath = os.path.join(self.licenseDir, fileName)
            print(filePath)
            with open(filePath + '.ttl', 'w') as file:
                file.write(''.join(lines))

    def fillTextFields(self, lines, textFields, uri):
        for textField in textFields:
            # text is split through children, fields with links have 3, with text only 2 fields
            text = textField.xpath(".//text()").getall()
            if text[0] in 'Source':
                lines.append('<' + uri + '> <http://purl.org/dc/terms/source> "' + text[2] + '" .\n')
            if text[0] in 'Publisher':
                lines.append('<' + uri + '> <http://purl.org/dc/terms/publisher> "' + text[1][3:] + '" .\n')

    def fillPermissions(self, lines, permissionsGroups, uri):
        # 1 field for permissions without duty (if exists), all other fields for permissions with duties
        # now share-alike is a duty for dalicc? if existant even the first field gets that duty
        for permissions in permissionsGroups:
            lines.append('<' + uri + '> <http://www.w3.org/ns/odrl/2/permission> [ \n')
            lines.append('a <http://www.w3.org/ns/odrl/2/Permission> ; \n')
            permissionPart = permissions.xpath("./ul//li/@data-uri").getall()
            for permission in permissionPart:
                lines.append('<http://www.w3.org/ns/odrl/2/action> <' + permission + '> ;\n')
            dutyPart = permissions.xpath("./div/ul//li/@data-uri").getall()
            if len(dutyPart) > 0:
                lines.append('<http://www.w3.org/ns/odrl/2/duty> [ \n')
                lines.append(' a <http://www.w3.org/ns/odrl/2/Duty> ;\n')
                for duty in dutyPart:
                    lines.append('<http://www.w3.org/ns/odrl/2/action> <' + duty + '> ;\n')
                lines.append('] \n')
            lines.append('] .\n')

    def fillProhibitions(self, lines, prohibitionBox, uri):
        lines.append('<' + uri + '> <http://www.w3.org/ns/odrl/2/prohibition> [ \n')
        lines.append('a <http://www.w3.org/ns/odrl/2/Prohibition> ; \n')
        for prohibition in prohibitionBox.xpath("./ul//li/@data-uri").getall():
            lines.append('<http://www.w3.org/ns/odrl/2/action> <' + prohibition + '> ;\n')
        lines.append('] .\n')
