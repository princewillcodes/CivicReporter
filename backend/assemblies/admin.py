from django.contrib import admin

from .models import Assembly, Region


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ("name", "official_code")
    search_fields = ("name", "official_code")


@admin.register(Assembly)
class AssemblyAdmin(admin.ModelAdmin):
    list_display = ("name", "official_code", "region", "contact_email", "contact_phone", "is_active")
    list_filter = ("region", "is_active")
    search_fields = ("name", "official_code", "contact_email", "contact_phone")
    autocomplete_fields = ("region",)
