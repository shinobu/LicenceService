import scrapy
import logging
import urllib
import shutil
import os
import time
logging.getLogger('scrapy').setLevel(logging.WARNING)


class daliccCrawler(scrapy.Spider):
    name = 'daliccCrawler'

    def __init__(self, category=None, *args, **kwargs):
        super(daliccCrawler, self).__init__(*args, **kwargs)
        self.start_urls = ['https://dalicc.net/license-library?page=0']
        self.counter = 0
        self.downloadURLs = []
        self.scriptDir = os.path.dirname(__file__)

    def parse(self, response):
        tmpURLs = response.css('a.download-rdf::attr(href)').getall()
        if tmpURLs[0] not in self.downloadURLs:
            self.downloadURLs += tmpURLs
            self.counter += 1
            yield response.follow('https://dalicc.net/license-library?page=' + str(self.counter), callback=self.parse)
        else:
            #download all files
            os.makedirs(self.scriptDir + '/tmp', exist_ok=True)
            for download in self.downloadURLs:
                url = 'https://dalicc.net' + download
                fileName = 'tmp/' + download[17:]
                filePath = os.path.join(self.scriptDir, fileName)
                downloaded = self.downloadFile(url, filePath)
                if not downloaded:
                    logging.getLogger().debug('failed downloading ' + fileName)

    def downloadFile(self, url, filePath):
        maxRetry = 50
        downloaded = False
        while(maxRetry > 0):
            try:
                with urllib.request.urlopen(url, timeout=10) as response, open(filePath, 'wb') as outffile:
                    shutil.copyfileobj(response, outffile)
                    downloaded = True
                break
            except urllib.error.URLError as e:
                maxRetry = maxRetry - 1
                time.sleep(10)
        return downloaded
