import React from 'react';
import { MapPin, Briefcase, Link as LinkIcon, Users, Calendar, ArrowUpRight } from 'lucide-react';
import type { GitHubProfile } from '../services/github';
import './ProfileCard.css';

interface ProfileCardProps {
  profile: GitHubProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="profile-card glass-panel animate-fade-in">
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img src={profile.avatar_url} alt={profile.name || profile.login} className="profile-avatar" />
        </div>
        <div className="profile-titles">
          <h2>{profile.name || profile.login}</h2>
          <a href={profile.html_url} target="_blank" rel="noopener noreferrer" className="profile-login-link">
            @{profile.login} <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {profile.bio && <p className="profile-bio">{profile.bio}</p>}

      <div className="profile-stats">
        <div className="stat-item">
          <Users size={16} className="stat-icon" />
          <div>
            <span className="stat-value">{profile.followers.toLocaleString()}</span>
            <span className="stat-label">followers</span>
          </div>
        </div>
        <div className="stat-item">
          <Users size={16} className="stat-icon" />
          <div>
            <span className="stat-value">{profile.following.toLocaleString()}</span>
            <span className="stat-label">following</span>
          </div>
        </div>
      </div>

      <div className="profile-meta">
        {profile.company && (
          <div className="meta-item">
            <Briefcase size={16} className="meta-icon" />
            <span>{profile.company}</span>
          </div>
        )}
        {profile.location && (
          <div className="meta-item">
            <MapPin size={16} className="meta-icon" />
            <span>{profile.location}</span>
          </div>
        )}
        {profile.blog && (
          <div className="meta-item">
            <LinkIcon size={16} className="meta-icon" />
            <a 
              href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="meta-link"
            >
              {profile.blog}
            </a>
          </div>
        )}
        <div className="meta-item">
          <Calendar size={16} className="meta-icon" />
          <span>Joined {joinDate}</span>
        </div>
      </div>
    </div>
  );
};
