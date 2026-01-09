from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver 
from django.urls import reverse 
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

class Review(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    start_date = models.DateTimeField(default=now, null=True, blank=True)
    end_date = models.DateTimeField(blank=True, null=True)
    status = models.BooleanField(default=False)  # True for completed, False for ongoing


class Study(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    year = models.IntegerField(blank=True, null=True)
    summary = models.TextField(blank=True)
    abstract = models.TextField(blank=True)
    flags = models.JSONField(default=list, blank=True)
    tags = models.ManyToManyField('Tag', blank=True, related_name='studies')
    authors = models.ManyToManyField('Author', blank=True, related_name='studies')
    doi = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    pages = models.CharField(max_length=255, blank=True)
    pathto_pdf = models.CharField(max_length=255, blank=True)
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='studies')
    # timescited = models.IntegerField(default=0) # May not be too useful to consider

    def __str__(self):
        return self.title

class Author(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='authors')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'review'], name='unique_author_per_review')
        ]

    def __str__(self):
        return self.name

class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='tags')
    parent_tag = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='child_tags'
    )

    def __str__(self):
        return self.name

    def get_tree(self):
        'Recursively builds the tree structure.'
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'children': [child.get_tree() for child in self.child_tags.all()]
        }
    



@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    sitelink = "http://localhost:5173/"
    token = "{}".format(reset_password_token.key)
    full_link = str(sitelink)+str("password-reset/")+str(token)

    print(token)
    print(full_link)

    context = {
        'full_link': full_link,
        'email_adress': reset_password_token.user.email
    }

    html_message = render_to_string("email.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject = "Request for resetting password for {title}".format(title=reset_password_token.user.email), 
        body=plain_message,
        from_email = "sender@example.com", 
        to=[reset_password_token.user.email]
    )

    msg.attach_alternative(html_message, "text/html")
    msg.send()
    