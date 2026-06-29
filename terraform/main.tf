provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "bureau_regions" {
  type    = list(string)
  default = ["us-east-1", "eu-west-1", "ap-south-1"]
}

# VPC Configuration
resource "aws_vpc" "global_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "khabar-cut-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.global_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
}

# RDS Aurora Multi-Region Cluster
resource "aws_rds_cluster" "primary_db" {
  cluster_identifier      = "khabar-cut-aurora-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "15.4"
  database_name           = "khabarcut"
  master_username         = "postgres"
  master_password         = "SecurePass123!"
  backup_retention_period = 7
  preferred_backup_window = "02:00-03:00"
}

# CloudFront CDN for global caching
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = "khabar-cut-alb.amazonaws.com"
    origin_id   = "ALB-Origin"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-Origin"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
