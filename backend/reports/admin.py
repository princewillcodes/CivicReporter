from django.contrib import admin

from .models import (
    Report,
    ReportAssignment,
    ReportCategory,
    ReportComment,
    ReportConfirmation,
    ReportStatusHistory,
)


@admin.register(ReportCategory)
class ReportCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "code", "description")
    prepopulated_fields = {"code": ("name",)}


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("reference_number", "category", "assembly", "urgency", "status", "reporter", "created_at")
    list_filter = ("status", "urgency", "category", "assembly", "created_at")
    search_fields = ("reference_number", "description", "location_name", "reporter__email", "reporter__full_name")
    autocomplete_fields = ("reporter", "assembly", "category")
    readonly_fields = ("reference_number", "created_at", "updated_at")
    date_hierarchy = "created_at"


@admin.register(ReportStatusHistory)
class ReportStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ("report", "previous_status", "status", "changed_by", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("report__reference_number", "note", "changed_by__email")
    autocomplete_fields = ("report", "changed_by")
    readonly_fields = ("created_at",)


@admin.register(ReportAssignment)
class ReportAssignmentAdmin(admin.ModelAdmin):
    list_display = ("report", "assigned_to", "assigned_by", "is_active", "assigned_at", "unassigned_at")
    list_filter = ("is_active", "assigned_at", "unassigned_at")
    search_fields = ("report__reference_number", "assigned_to__email", "assigned_to__full_name")
    autocomplete_fields = ("report", "assigned_to", "assigned_by")
    readonly_fields = ("assigned_at",)


@admin.register(ReportConfirmation)
class ReportConfirmationAdmin(admin.ModelAdmin):
    list_display = ("report", "confirmed_by", "created_at")
    list_filter = ("created_at",)
    search_fields = ("report__reference_number", "confirmed_by__email", "confirmed_by__full_name")
    autocomplete_fields = ("report", "confirmed_by")
    readonly_fields = ("created_at",)


@admin.register(ReportComment)
class ReportCommentAdmin(admin.ModelAdmin):
    list_display = ("report", "author", "is_public", "created_at", "updated_at")
    list_filter = ("is_public", "created_at")
    search_fields = ("report__reference_number", "author__email", "body")
    autocomplete_fields = ("report", "author")
    readonly_fields = ("created_at", "updated_at")
