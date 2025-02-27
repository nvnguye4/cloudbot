provider "aws" {
    region = "us-east-1"
  }
  
  resource "aws_iam_role" "discord_bot_role" {
    name = "EC2ECRAccessRole"
  
    assume_role_policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }]
    })
  }
  
  resource "aws_iam_policy_attachment" "discord_bot_ecr_access" {
    name       = "discord-bot-ecr-policy-attachment"
    roles      = [aws_iam_role.discord_bot_role.name]
    policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
  }

  resource "aws_iam_policy" "ssm_parameter_access" {
  name        = "SSMParameterAccess"
  description = "Allows EC2 to access specific SSM parameters"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:us-east-1:897729133201:parameter/BOT_TOKEN"

      }
    ]
  })
}

  resource "aws_iam_policy_attachment" "ssm_policy_attachment" {
  name       = "discord-bot-ssm-policy-attachment"
  roles      = [aws_iam_role.discord_bot_role.name]
  policy_arn = aws_iam_policy.ssm_parameter_access.arn
  }
  
  resource "aws_iam_instance_profile" "discord_bot_profile" {
    name = "EC2ECRAccessProfile"
    role = aws_iam_role.discord_bot_role.name
  }
  
  resource "aws_instance" "discord_bot" {
    ami                  = "ami-05b10e08d247fb927"
    instance_type        = "t2.micro"
    key_name             = "discord-bot"
    security_groups      = [aws_security_group.discord_bot_sg.name]
    iam_instance_profile = aws_iam_instance_profile.discord_bot_profile.name
  
    user_data = <<-EOF
                #!/bin/bash
                yum update -y
                amazon-linux-extras enable docker
                yum install docker -y
                systemctl start docker
                systemctl enable docker
                usermod -aG docker ec2-user
  
                # Login to AWS ECR
                aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 897729133201.dkr.ecr.us-east-1.amazonaws.com
  
                # Pull and run the Discord bot container
                docker pull 897729133201.dkr.ecr.us-east-1.amazonaws.com/cloud-bot:latest
                docker run -d --restart unless-stopped --name cloud-bot -e BOT_TOKEN=$(aws ssm get-parameter --name "BOT_TOKEN" --with-decryption --query "Parameter.Value" --output text) 897729133201.dkr.ecr.us-east-1.amazonaws.com/cloud-bot:latest
                EOF
  
    tags = {
      Name = "DiscordBotEC2"
    }
  }
  
  resource "aws_security_group" "discord_bot_sg" {
    name        = "discord-bot-sg"
    description = "Allow SSH and Discord bot traffic"
  
    ingress {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  
    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
  
  output "instance_public_ip" {
    value       = aws_instance.discord_bot.public_ip
    description = "The public IP address of the EC2 instance"
  }
  
  output "instance_public_dns" {
    value       = aws_instance.discord_bot.public_dns
    description = "The public DNS of the EC2 instance"
  }
  