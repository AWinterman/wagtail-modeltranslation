# coding: utf-8

from wagtail.wagtailcore.models import Page

from modeltranslation.translator import translator, TranslationOptions


# regist wagtail Page model for translation
class PageTR(TranslationOptions):
    fields = (
        'title',
        'slug',
        'seo_title',
        'search_description',)

translator.register(Page, PageTR)
