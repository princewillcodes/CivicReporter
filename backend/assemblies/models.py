from django.db import models


class Region(models.Model):
    name = models.CharField(max_length=120, unique=True)
    official_code = models.CharField(max_length=20, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Assembly(models.Model):
    name = models.CharField(max_length=180)
    official_code = models.CharField(max_length=30, unique=True)
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name="assemblies")
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=24, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["region__name", "name"]
        constraints = [
            models.UniqueConstraint(fields=["region", "name"], name="unique_assembly_name_region"),
        ]
        indexes = [
            models.Index(fields=["region", "is_active"], name="assembly_region_active_idx"),
            models.Index(fields=["name"], name="assembly_name_idx"),
        ]
        verbose_name_plural = "assemblies"

    def __str__(self):
        return f"{self.name} ({self.official_code})"
