"""Stdlib-only smoke checks for built HTML/PWA files (no hardware test)."""
import json
import pathlib
import re
import unittest
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=set()
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if 'id' in d: self.ids.add(d['id'])
        if tag in ('a','link','script','img'):
            key={'a':'href','link':'href','script':'src','img':'src'}[tag]
            if key in d: self.links.append(d[key])
class CheckAssets(unittest.TestCase):
    def test_manifest(self):
        data=json.loads((ROOT/'manifest.webmanifest').read_text())
        for icon in data['icons']: self.assertTrue((ROOT/icon['src']).is_file())
        self.assertTrue((ROOT/data['start_url']).is_file())
    def test_local_links(self):
        for f in ['index.html','vanitas.html','device-lab.html']:
            doc=Links(); doc.feed((ROOT/f).read_text())
            for link in doc.links:
                if link.startswith(('#','https://','http://','mailto:','data:')): continue
                self.assertTrue((ROOT/link).is_file(),(f,link))
    def test_device_controls_exist(self):
        doc=Links(); doc.feed((ROOT/'device-lab.html').read_text())
        for id in ['connect','disconnect','battery','heart-start','heart-stop','audio-test','events']:
            self.assertIn(id,doc.ids)
    def test_no_unsafe_browser_patterns(self):
        for f in ['index.html','vanitas.html','device-lab.html']:
            s=(ROOT/f).read_text()
            self.assertNotIn('user-scalable=no',s)
            self.assertNotIn('window.ontouchmove',s)
            self.assertNotIn('onclick=',s)
    def test_no_remote_fonts(self):
        for f in ["assets/css/main.css","assets/css/style.css"]:
            self.assertNotIn("fonts.googleapis.com",(ROOT/f).read_text())
    def test_no_ble_writes_or_telemetry(self):
        s=(ROOT/'assets/js/device-lab.js').read_text()
        for blocked in ['writeValue(', 'sendBeacon(', 'fetch(', 'XMLHttpRequest(', 'localStorage.', 'eval(']:
            self.assertNotIn(blocked,s)
if __name__=='__main__': unittest.main()
