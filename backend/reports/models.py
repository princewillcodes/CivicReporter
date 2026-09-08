import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q

from assemblies.models import Assembly


def generate_report_reference():
    return f"CR-{uuid.uuid4().hex[:10].upper()}"


class ReportCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    code = models.SlugField(max_length=60, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "report categories"
        indexes = [models.Index(fields=["is_active", "name"], name="category_active_name_idx")]

    def __str__(self):
        return self.name


class Report(models.Model):
    class Urgency(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        ASSIGNED = "assigned", "Assigned"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        REJECTED = "rejected", "Rejected"
        DUPLICATE = "duplicate", "Duplicate"

    reference_number = models.CharField(max_length=24, unique=True, default=generate_report_reference, editable=False)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports",
        help_text="Empty for guest submissions.",
    )
    assembly = models.ForeignKey(
        Assembly,
        on_delete=models.PROTECT,
        related_name="reports",
        db_index=False,
        help_text="Assigned by backend coordinate lookup; never trust a client-provided value.",
    )
    category = models.ForeignKey(ReportCategory, on_delete=models.PROTECT, related_name="reports", db_index=False)
    description = models.TextField()
    urgency = models.CharField(max_length=12, choices=Urgency.choices, default=Urgency.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.DecimalField(max_digits=9, decimal_places=6, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    approximate_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    approximate_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    location_name = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to="reports/%Y/%m/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"], name="reports_status_idx"),
            models.Index(fields=["assembly"], name="reports_assembly_idx"),
            models.Index(fields=["category"], name="reports_category_idx"),
            models.Index(fields=["urgency"], name="reports_urgency_idx"),
            models.Index(fields=["created_at"], name="reports_created_idx"),
            models.Index(fields=["assembly", "status", "-created_at"], name="reports_area_status_idx"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(latitude__gte=-90, latitude__lte=90), name="report_valid_latitude"),
            models.CheckConstraint(condition=Q(longitude__gte=-180, longitude__lte=180), name="report_valid_longitude"),
            models.CheckConstraint(condition=Q(approximate_latitude__gte=-90, approximate_latitude__lte=90) | Q(approximate_latitude__isnull=True), name="report_valid_approx_lat"),
            models.CheckConstraint(condition=Q(approximate_longitude__gte=-180, approximate_longitude__lte=180) | Q(approximate_longitude__isnull=True), name="report_valid_approx_lng"),
        ]

    def __str__(self):
        return f"{self.reference_number} · {self.category}"


class ReportStatusHistory(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="status_history")
    previous_status = models.CharField(max_length=20, choices=Report.Status.choices, blank=True)
    status = models.CharField(max_length=20, choices=Report.Status.choices)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="report_status_changes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name_plural = "report status histories"
        indexes = [models.Index(fields=["report", "created_at"], name="status_report_date_idx")]

    def __str__(self):
        return f"{self.report.reference_number}: {self.get_status_display()}"


class ReportAssignment(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="assignments")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="report_assignments")
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="report_assignments_made")
    note = models.TextField(blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    unassigned_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-assigned_at"]
        constraints = [
            models.UniqueConstraint(fields=["report"], condition=Q(is_active=True), name="one_active_assignment_report"),
        ]
        indexes = [
            models.Index(fields=["assigned_to", "is_active"], name="assignment_user_active_idx"),
            models.Index(fields=["report", "assigned_at"], name="assignment_report_date_idx"),
        ]

    def __str__(self):
        return f"{self.report.reference_number} → {self.assigned_to.full_name}"


class ReportConfirmation(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="confirmations")
    confirmed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="report_confirmations")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["report", "confirmed_by"], name="unique_report_confirmation"),
        ]
        indexes = [models.Index(fields=["report", "created_at"], name="confirm_report_date_idx")]

    def __str__(self):
        return f"{self.confirmed_by.full_name} confirmed {self.report.reference_number}"


class ReportComment(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="report_comments")
    body = models.TextField()
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["report", "is_public", "created_at"], name="comment_report_public_idx")]

    def __str__(self):
        author = self.author.full_name if self.author else "System"
        return f"{author} on {self.report.reference_number}"
